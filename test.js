const aggrDataTests = require('./imports/test/aggregatedata5minTests.js');

const db = require('./imports/api/serverFunctions').db;

const logger = require('./imports/startup/startup-logger').logger;

if (process.env.startEpoch === undefined) {
	throw new error("Environment variable 'startEpoch' undefined");
} else if (isNaN(parseInt(process.env.startEpoch))) {
	throw new error("Environment variable 'startEpoch' is NaN");
}

if (process.env.endEpoch === undefined) {
	throw new error("Environment variable 'endEpoch' undefined");
} else if (isNaN(parseInt(process.env.endEpoch))) {
	throw new error("Environment variable 'endEpoch' is NaN");
}

if (process.env.aqsid === undefined) {
	throw new error("Environment variable 'aqsid' undefined");
}

aggrDataTests.testForDesyncsFromLiveDataToAggregateData5Min(process.env.aqsid, process.env.startEpoch, process.env.endEpoch);
