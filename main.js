import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import mongodb from 'mongodb';
import Papa from 'papaparse';
import moment from 'moment';

import { dburl, aqsid } from './modules/startup.js';
import checkInitialEnvironmentVariables from './modules/startup.js';

checkInitialEnvironmentVariables();

//DB connection setup
var dbConn;
var incoming;
//watcher setup
let liveWatcher;
mongodb.MongoClient.connect(dburl, {
	useUnifiedTopology: true,
}).then((client) => {
	console.log("DB Connected!");
	dbConn = client.db();
	// find site information
	dbConn.collection("livesites").findOne({ AQSID: `${aqsid}` }, function (err, result) {
		if (err) throw err;
		incoming = `/hnet/incoming/current/${result.incoming}`;
		liveWatcher = chokidar.watch(incoming, {
			ignored: /[\/\\]\./,
			ignoreInitial: true,
			usePolling: true,
			persistent: true
		});

		//we will only import when file is added
		liveWatcher.on('add', (filePath) => {
			console.log('File ', filePath, ' has been added.');
			readFile(filePath)
		}).on('error', (error) => {
			console.error('LiveWatcher error ', error);
		}).on('ready', () => {
			console.log(`Ready for changes in ${incoming}`);
		});
	});
}).catch(err => {
	console.error("DB Connection Error: ${err.message}");
});

const readFile = (filePath) => {
	const pathArray = filePath.split(path.sep);
	const fileName = pathArray[pathArray.length - 1];
	const siteId = fileName.split(/[_]+/)[1];
	const parentDir = pathArray[pathArray.length - 2];
	const test = parentDir.split(/[_]+/)[1];

	if (siteId === test) {
		console.log("Start import", filePath)
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
									metric: "numValid",
									val: NaN
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
										metric: "numValid",
										val: NaN
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

				//we upsert data
				collection.bulkWrite(
					allObjects.map((item) =>
						({
							updateOne: {
								filter: { _id: item._id },
								update: { $set: item },
								upsert: true
							}
						})
					), function (err, result) {
						if (err) console.error('Error during bulkwrite ', err)
						if (result) {
							console.log('Finished import of file ', filePath, 'Upserted: ', result.nUpserted, 'Modified: ', result.nModified);
							const stats = fs.statSync(filePath);
							const fileModified = moment(Date.parse(stats.mtime)).unix(); // from milliseconds into moments and then epochs
							// find site and update lastUpdateEpoch
							dbConn.collection("livesites").findOneAndUpdate({ AQSID: `${aqsid}` }, {
								$set: {
									lastUpdateEpoch: fileModified
								}
							}, function (err, re) {
								if (err) throw err;
							});
						}
					});
			}
		});
	}
}




