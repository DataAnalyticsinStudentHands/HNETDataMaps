// libraries
const moment = require('moment');
// Project code
const logger = require('../startup/startup-logger').logger;

const collectionNames = require('../api/serverFunctions').collectionNames;
const db = require('../api/serverFunctions').db;



// This function goes through the specified aggregatedata5min and look for gaps between a specified start and end epoch for a defined site.
// Once it has found those gaps, it will then run the livedata and look to see if those gaps exists because livedata was empty or because something foobared.
// If something foobared, send an error and tell user that test failed (and where). 
// Go ahead and check to see if the test is accurate. May need adjustments in the future
function testForDesyncsFromLiveDataToAggregateData5Min(aqsid, startEpoch, endEpoch) {

	// Pipeline operation for aggregate
	const pipeline = [
		{
			$match: {
				$and: [
					{
						epoch: {
							$gt: parseInt(startEpoch, 10),
							$lt: parseInt(endEpoch, 10)
						}
					}, {
						site: aqsid
					}
				]
			}
		}, {
			$sort: {
				epoch: -1
			}
		}
	];

	let testPassed = true;
	// This variable is to allow the setInterval telling whether the test passed or failed to know whether or not countDocuments is finished
	let countDocsOnLiveDataRunning = 0;
	db.aggregate(collectionNames.AggrData, pipeline, { socketTimeoutMS: 600000, connectTimeoutMS: 600000, allowDiskUse: true }, (err, res) => {
		let previousEpoch = 0;
		let previousID = 0;
		res.forEach((e) => {
			// basically we are checking for previous epoch being more that 400 from current epoch because 300 (seconds) is 5 minutes.
			// If there is a gap, then call countDocuments on livedata to check if it is missing due to failed aggregation or files missing
			if (previousEpoch !== 0) {
				if (e.epoch > previousEpoch + 400 || e.epoch < previousEpoch - 400) {

					// Cute query for our countDoc
					let countDocQuery = {
						site: aqsid,
						epoch: {
							$gt: parseInt(previousEpoch),
							$lt: parseInt(e.epoch)
						}
					};

					countDocsOnLiveDataRunning++;
					db.countDocuments(collectionNames.LiveData, countDocQuery, {}, (err, res) => {
						if (!err && res > 60) {
							// test fails if livedata is populated but aggregatedata5min isn't
							testPassed = false;
							logger.error(`There was a gap of ${Math.abs(e.epoch - previousEpoch)} between _id: ${e._id} and ${previousID}. Dates for epochs are: ${moment.unix(e.epoch).format('YYYY/MM/DD HH:mm:ss')} and ${moment.unix(previousEpoch).format('YYYY/MM/DD HH:mm:ss')} `);
						}
						countDocsOnLiveDataRunning--;
					});
				}
			}
			previousEpoch = e.epoch;
			previousID = e._id;
		});
	}).then(() => {

		// Need to do interval
		// Check if countDocs are still running then call testPassed.
		// properly log which case it falls under
		const waitForTestToFinishInterval = setInterval(() => {
			if (!countDocsOnLiveDataRunning) {
				if (testPassed) {
					logger.info(`Testing for gaps in collection aggregatedata5min for site: ${aqsid} between epochs: ${startEpoch} - ${endEpoch} has passed!`);
				} else {
					logger.warn(`Testing for gaps in collection aggregatedata5min for site: ${aqsid} between epochs: ${startEpoch} - ${endEpoch} has failed!`);
				}

				clearInterval(waitForTestToFinishInterval);
			}
		});
	});

}

module.exports = { testForDesyncsFromLiveDataToAggregateData5Min };
