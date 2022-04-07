import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { createLogger, format, transports } from 'winston';
import mongodb from 'mongodb';
import Papa from 'papaparse';
import moment from 'moment';

import { dburl, aqsid }  from './modules/startup.js';
import checkInitialEnvironmentVariables from './modules/startup.js';

checkInitialEnvironmentVariables();

//Logger setup
const logger = createLogger({
	level: 'info',
	format: format.simple(),
	transports: [new transports.Console()]
})

//DB connection setup
var dbConn;
var incoming;
//watcher setup
let liveWatcher;
mongodb.MongoClient.connect(dburl, {
	useUnifiedTopology: true,
}).then((client) => {
	logger.info("DB Connected!");
	dbConn = client.db();
	// find site information
	dbConn.collection("livesites").findOne({ AQSID: `${aqsid}` }, function(err, result) {
		if (err) throw err;
		incoming = `/hnet/incoming/current/${result.incoming}`;
		console.log(incoming);
		liveWatcher = chokidar.watch(incoming, {
			ignored: /[\/\\]\./,
			ignoreInitial: true,
			usePolling: true,
			persistent: true
		});
	  });
}).catch(err => {
	logger.error("DB Connection Error: ${err.message}");
});

//we will only import when file is added
liveWatcher.on('add', (filePath) => {
	logger.info('File ', filePath, ' has been added.');
	const pathArray = filePath.split(path.sep);
	const fileName = pathArray[pathArray.length - 1];
	const siteId = fileName.split(/[_]+/)[1];
	const parentDir = pathArray[pathArray.length - 2];
	const test = parentDir.split(/[_]+/)[1];

	if (siteId === test) {
		logger.info("Will import", filePath)
		//create objects from parsed lines in csv
		const allObjects = [];
		Papa.parse(fs.createReadStream(filePath), {
			header: true,
			step: function (result) {
				const obj = {};
				//create _id, epoch etc.
				let epoch = moment(result.data.TheTime).unix();
      			obj._id = `${aqsid}_${epoch}`;
				obj.site = `${aqsid}`;
				obj.epoch = epoch;
				obj.subTypes = {};
				let instrument = [];
				for (const key in result.data) {
					// Fix for wrong headers _Wind
					let newKey = key;
					if (key.indexOf('_Wind') >= 0) {
						newKey = key.replace('_Wind', '');
					}
					const subKeys = newKey.split('_'); // split each column header
					if (subKeys.length > 1) { // skipping e.g. 'TheTime'
						instrument = subKeys[2]; // instrument i.e. Wind, Ozone etc.
						const measurement = subKeys[3]; // measurement conc, temp, etc.
						let unitType = 'NA';
						if (subKeys[4] !== undefined) {
							unitType = subKeys[4]; // unit
						}
						if (!obj.subTypes[instrument]) {
							obj.subTypes[instrument] = {};
							obj.subTypes[instrument][measurement] = [
								{
									metric: "sum",
									val: NaN
								},
								{
									metric: "avg",
									val: parseFloat(result.data[newKey]) // the actual value
								},
								{
									metric : "numValid", 
									val : NaN
								},
								{
									metric: "unit",
									val: unitType
								}
							]
							// a new measurement is found
						} else if (!obj.subTypes[instrument][measurement]) {
							if (measurement !== "Flag") {
								obj.subTypes[instrument][measurement] = [
									{
										metric: "sum",
										val: NaN
									},
									{
										metric: "avg",
										val: parseFloat(result.data[newKey])
									},
									{
										metric : "numValid", 
										val : NaN
									},
									{
										metric: "unit",
										val: unitType
									}
								]
							} else {
								//put flag with each measurement
								for (const measurement in obj.subTypes[instrument]) {
									obj.subTypes[instrument][measurement].push({
										metric: "Flag",
										val: parseInt(result.data[newKey])
									})
								}
							}
						}
					}
				}
				allObjects.push(obj);
			},
			complete: function (results) {
				//inserting into the “Aggregated5minuteData”
				var collectionName = 'aggregatedata5min';
				var collection = dbConn.collection(collectionName);
				collection.insertMany(allObjects, (err, result) => {
					if (err) logger.error(err);
					if (result) {
						logger.info(`Imported ${filePath} into database successfully.`);
					}
				}); 
			}
		});
	}
}).on('error', (error) => {
	logger.error('Error happened', error);
}).on('ready', () => {
	logger.info(`Ready for changes in ${incoming}`);
});


