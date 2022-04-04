const chokidar = require('chokidar');
const path = require('path');
const { createLogger, format, transports } = require('winston')
const mongodb = require('mongodb');
const Papa = require('papaparse');

var url = "mongodb://localhost:27017/DataMaps";

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

liveWatcher.on('add', (filePath) => {
  console.log('File ', filePath, ' has been added.');
  const pathArray = filePath.split(path.sep);
  const fileName = pathArray[pathArray.length - 1];
  const siteId = fileName.split(/[_]+/)[1];
  const parentDir = pathArray[pathArray.length - 2];
  const test = parentDir.split(/[_]+/)[1];

  if (siteId === test || fileName.startsWith('TAP')) {
    console.log("Will import", filePath)
    // Parse local CSV file
    Papa.parse(filePath, {
      complete: function(results) {
        console.log("Did read:", results.data);

        arrayToInsert = [];
        //inserting into the “Aggregated5minuteData”
        var collectionName = 'aggregatedata5min';
        var collection = dbConn.collection(collectionName);
        collection.insertMany(arrayToInsert, (err, result) => {
         if (err) console.log(err);
         if(result){
             console.log("Import CSV into database successfully.");
         }
        });

      }
    })
  }
}).on('error', (error) => {
  logger.error('Error happened', error);
}).on('ready', () => {
  logger.info(`Ready for changes in /hnet/incoming/current/BOEM_SC_DAQData`);
});


    // creates objects from input files that are following HNET format
function makeObj(keys, startIndex, previousObject) {
	const obj = {};
	obj.subTypes = {};
	let metron = [];
	for (const key in keys) {
		if (keys.hasOwnProperty(key)) {
			// Fix for wrong headers _Wind
			let newKey = key;
			if (key.indexOf('_Wind') >= 0) {
				newKey = key.replace('_Wind', '');
			}
			const subKeys = newKey.split('_'); // split each column header
			if (subKeys.length > startIndex) { // skipping e.g. 'TheTime'
				metron = subKeys[2]; // instrument i.e. Wind, Ozone etc.
				const measurement = subKeys[3]; // measurement conc, temp, etc.
				const value = keys[key];
				let unitType = 'NA';
				if (subKeys[4] !== undefined) {
					unitType = subKeys[4]; // unit
				}

				if (!obj.subTypes[metron]) {
					obj.subTypes[metron] = [
						{
							metric: measurement,
							val: value,
							unit: unitType
						}
					];
				} else if (measurement === 'Flag') { // Flag should be always first
					obj.subTypes[metron].unshift({ metric: measurement, val: value });
				} else {
					obj.subTypes[metron].push({ metric: measurement, val: value, unit: unitType });
				}
			}
		}
	}

	for (const subType in obj.subTypes) {
		if (obj.subTypes.hasOwnProperty(subType)) {
			// fix automatic flagging of 03 values to be flagged with 9(N)
			if (subType === 'O3' || subType === '49i') {
				// condition: O3 value above 250
				if (obj.subTypes[subType][1].val > 250) {
					obj.subTypes[subType][0].val = 9;
				}
				// if a O3 value changes for more than 30 ppb from previous value
				if (previousObject) {
					const diff = obj.subTypes[subType][1].val - previousObject.subTypes[subType][1].val;
					if (diff >= 30) {
						obj.subTypes[subType][0].val = 9;
					}
				}
			}
			// fix for RH values
			if (subType === 'TRH' || subType === 'HMP60') {
				// find index for RH channel
				let rhIndex = 0;
				obj.subTypes[subType].forEach((item, index) => {
					if (item.metric === 'RH') {
						rhIndex = index;
					}
				});
				// condition: RH value < 1 -> set to 100
				if (obj.subTypes[subType][rhIndex].metric === 'RH' && obj.subTypes[subType][rhIndex].val.length !== 0 && obj.subTypes[subType][rhIndex].val < 1) {
					obj.subTypes[subType][rhIndex].val = 100;
				}
				// condition: prevoius RH value - current RH > 15 -> set to 100
				if (previousObject) {
					if (obj.subTypes[subType][rhIndex].metric === 'RH' && ((obj.subTypes[subType][rhIndex].val - previousObject.subTypes[subType][rhIndex].val) > 15)) {
						obj.subTypes[subType][rhIndex].val = 100;
					}
				}
			}
		}
	}

	return obj;
}




