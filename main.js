const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const { createLogger, format, transports } = require('winston')
const mongodb = require('mongodb');
const Papa = require('papaparse');
const moment = require('moment');

var url = "mongodb://localhost:27017/DataMaps";
var aqsid = 99950;

//Logger setup
const logger = createLogger({
	level: 'info',
	format: format.simple(),
	transports: [new transports.Console()]
})

//DB connection setup
var dbConn;
mongodb.MongoClient.connect(url, {
	useUnifiedTopology: true,
}).then((client) => {
	console.log("DB Connected!");
	dbConn = client.db();
}).catch(err => {
	console.log("DB Connection Error: ${err.message}");
});

//watcher setup
const liveWatcher = chokidar.watch(`/hnet/incoming/current/BOEM_SC_DAQData`, {
	ignored: /[\/\\]\./,
	ignoreInitial: true,
	usePolling: true,
	persistent: true
});

//we will only import when file is added
liveWatcher.on('add', (filePath) => {
	console.log('File ', filePath, ' has been added.');
	const pathArray = filePath.split(path.sep);
	const fileName = pathArray[pathArray.length - 1];
	const siteId = fileName.split(/[_]+/)[1];
	const parentDir = pathArray[pathArray.length - 2];
	const test = parentDir.split(/[_]+/)[1];

	if (siteId === test || fileName.startsWith('TAP')) {
		console.log("Will import", filePath)
		//parse local CSV file
		Papa.parse(fs.createReadStream(filePath), {
			complete: function (results) {
				// create objects from parsed lines
				const allObjects = [];
				const header = results.data[0];
				//loop over parsed data
				for (let k = 1; k < results.data.length; k++) {
					const data = results.data[k];
					const obj = {};
					obj.subTypes = {};
					let instrument = [];
					for (let i = 0; i < header.length; i++) {
						//work through different columns
						const subKeys = header[i].split('_'); // split each column header
						if (subKeys.length > 1) { // skipping 'TheTime'
							instrument = subKeys[2]; // instrument i.e. Wind, Ozone etc.
							const measurement = subKeys[3]; // measurement conc, temp, etc.
							const value = data[i];
							let unitType = 'NA';
							if (subKeys[4] !== undefined) {
								unitType = subKeys[4]; // unit
							}
							if (!obj.subTypes[instrument]) {
								obj.subTypes[instrument] = [
									{
										metric: measurement,
										val: value,
										unit: unitType
									}
								];
							} else if (measurement === 'Flag') { // Flag should be always first
								obj.subTypes[instrument].unshift({ metric: measurement, val: value });
							} else {
								obj.subTypes[instrument].push({ metric: measurement, val: value, unit: unitType });
							}
							console.log(obj);
						} else {
							//create epoch and _id etc.
							let epoch = moment(data[0]).unix();
							obj.epoch = epoch;
							obj.site = aqsid;
							obj._id = `${aqsid}_${epoch}`;
						}
					}
					allObjects.push(singleObj);
				}

				//console.log(allObjects);

				//inserting into the “Aggregated5minuteData”
				var collectionName = 'aggregatedata5min';
				var collection = dbConn.collection(collectionName);
				/* collection.insertMany(allObjects, (err, result) => {
					if (err) console.log(err);
					if (result) {
						console.log("Import CSV into database successfully.");
					}
				}); */
			}
		});
	}
}).on('error', (error) => {
	logger.error('Error happened', error);
}).on('ready', () => {
	logger.info(`Ready for changes in /hnet/incoming/current/BOEM_SC_DAQData`);
});




