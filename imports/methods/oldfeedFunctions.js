/* old meteor code
import pathModule from 'path';
import fs from 'fs-extra';
import { logger } from '../startup/startup-logger.js';
import { globalsite } from '../startup/server/startup.js';
import { readFile } from './aggregationFunctions.js';
import { importOldJobJobStatus } from '../api/constants.js';
import { collectionNames, find } from '../api/serverFunctions.js';
*/

// libraries
const pathModule = require('path');
const fs = require('fs-extra');
const moment = require('moment');
const store = require('store2');

// Project code
const logger = require('../startup/startup-logger').logger;

const globalsite = require('../startup/server/startup').globalsite;

const readFile = require('./aggregationFunctions').readFile;
const aggregationFunctions = require('./aggregationFunctions');
const perform5minAggregat = require('./aggregationFunctions').perform5minAggregat;

const importOldJobStatus = require('../api/constants').importOldJobStatus;

const collectionNames = require('../api/serverFunctions').collectionNames;
const db = require('../api/serverFunctions').db;

let currentlyRunning = false;

async function performOldImport() {
	const job = await db.findOne(collectionNames.ImportOldJob, { jobStatus: importOldJobStatus.pending });

	// This is just a check to ensure a crash happened or not. If it did, then this will return an object that is still "running" despite currentlyRunning being false.
	// Remember currentlyRunning must be false in order for performOldImport to run, so if logically currentlyRunning and jobStatus: "running" cannot be true at this line of code.
	const jobCurrentlyRunning = await db.findOne(collectionNames.ImportOldJob, { jobStatus: importOldJobStatus.running });
	if (await jobCurrentlyRunning !== undefined && await jobCurrentlyRunning !== null) {
		// Update it and continue normally
		logger.error(`importOldJob _id ${jobCurrentlyRunning._id} is said to be running despite no function running it. Resolving`);
		db.updateOne(collectionNames.ImportOldJob, { _id: jobCurrentlyRunning._id }, { $set: { jobStatus: importOldJobStatus.pending }}, {});
	}

	// Get find and for jobStatus "pending" and "running". If running exists, return out of the function so we can wait for the one running to end

	// Only run if jobs exist and is pending.
	// SetTimout to force JS to wait for findOne to finish
	if (await job !== undefined && await job !== null) {

		db.updateOne(collectionNames.ImportOldJob, { _id: job._id }, { $set: { jobStatus: importOldJobStatus.running }});
		let overwriteAggrDataRunning = job.overwriteAggrData;

		// Avoid code duplication via function
		// insertionFunction is just a general function used to run the code. It sets everything up then starts aggregating and updating livedata
		async function insertionFunction() {

			// Do this asynchronously. Just await for aggregate to finish
			/* sample json for oldJobs schema
{
	"_id" : "99995_1621445080",
	"site" : "99995",
	"user" : "whitmireshane@gmail.com",
	"startEpoch" : NumberInt(1601510400),
	"endEpoch" : NumberInt(1621444800),
	"submitEpoch" : NumberInt(1621445080),
	"jobStatus" : "pending",
	"overwriteLiveData" : false,
	"overwriteAggrData" : true
},
{ 
		"_id" : "482010695_1621445080", 
		"site" : "482010695", 
		"user" : "whitmireshane@gmail.com", 
		"startEpoch" : NumberInt(1495980300), 
		"endEpoch" : NumberInt(1621445700), 
		"submitEpoch" : NumberInt(1621445980), 
		"jobStatus" : "pending", 
		"overwriteLiveData" : false, 
		"overwriteAggrData" : false
}

jobStatus can be either done, pending, or running
*/
			// Need to query livesite for more information
			const site = await db.findOne( collectionNames.LiveSites, { AQSID: job.site }, {} );
			// prep aggregationFunctions to run
			aggregationFunctions.initialize({ site });

			logger.info(`Importing old data for ${site.siteName} from ${job.startEpoch} - ${job.endEpoch} ${moment.unix(job.startEpoch).format('YYYY/MM/DD HH:mm:ss')} - ${moment.unix(job.endEpoch).format('YYYY/MM/DD HH:mm:ss')}`);

			const folder = `/hnet/incoming/current/${site.incoming}`; 

			// Sync is better imo
			let files = fs.readdirSync(folder);

			// Gets the startDate and endDate from start and end epoch
			let startDate = new Date(job.startEpoch*1000);
			let endDate = new Date(job.endEpoch*1000);

			// Remove from files if the date exceeds start or end date
			for (let i = files.length - 1; i >= 0; i--) {
				let currFile = String(files[i]);
				let date = currFile.substring(currFile.lastIndexOf('_') + 1, currFile.lastIndexOf('.'));

				// Some file include the letter a near the end of the file name. Let's get rid of that
				if (date.length - date.lastIndexOf('a') < 5) {
					date = date.slice(0, -1);
				}

				let day = parseInt(date.substring(4,6));
				let month = parseInt(date.substring(2,4));
				let year = parseInt(date.substring(0,2));

				// Gotta parse for TAP or met files. They structure their dates differently from daqFactory files. It's stupid imo
				if (currFile.includes("TAP")) {
					date = currFile.substring(currFile.lastIndexOf('_', currFile.lastIndexOf('_') - 1) + 1, currFile.lastIndexOf('_'));

					day = parseInt(date.substring(4,6));
					month = parseInt(date.substring(2,4));
					year = parseInt(date.substring(0,2));
				}

				if (currFile.includes("met")) {
					day = parseInt(date.substring(6,8));
					month = parseInt(date.substring(4,6));
					year = parseInt(date.substring(0,4));
				}

				// All data is after year 2000. We parse to the tens place because that is what it goes up to on the file. Have to add on the 2000 ourselves
				// Apparantly, met data already has 2000 appended to it. Fuck I hate inconsistency
				if (!currFile.includes("met")) {
					year += 2000;
				}

				date = new Date(year, month - 1, day);

				// The most important step, no need to do dates outside of our range
				if (!(startDate < date && date < endDate)) {
					files.splice(i, 1);
				}
			}

			// Split up the DaqFactory files and the non DaqFactory files
			let daqFactoryFiles = [];
			let otherFiles = [];
			let aggregateCountDocPerFileRunning = true;
			let countDocPerFileRunning = false;

			// This is hell right here, but I'll try my best to explain it
			// This interval is here to countDocuments per file in livedata. If enough data exists, don't aggregate it, otherwise run it. 
			// Exception: DAQFactory files. They will ALWAYS be ran.
			// We need to do an Interval because of the way asynchronous JS works. 
			// If we don't, we will end up connecting to MongoDB too many times and crash it.
			const countDocPerFileInterval = setInterval(() => {

				// This is kind of a ghetto fix to another problem. 
				// Basically overwriteAggrData can sometimes take a WHILE to finish. 
				// My problem is, I can't run insertionFunction twice.
				// My solution was to have a variable set at overwriteAggrData to check if it were running. 
				// As soon as it stops, the code is free to run. 
				// This is the "stop" point to wait for overwriteAggrData.
				if (!overwriteAggrDataRunning) {

					// clear the interval once we have gone through all the files
					if (!files.length) {
						aggregateCountDocPerFileRunning = false;
						clearInterval(countDocPerFileInterval);
						countDocPerFileRunning = true;
					}

					// Check if previous countDocPerFileInterval is still Running or not.
					if (!countDocPerFileRunning) {
						countDocPerFileRunning = true;

						// avoid as much code duplication as possible
						function fileTypeThenPush(fileName, fileType) {
							if (fileType.endsWith('met') || fileType.startsWith('TAP')) {
								otherFiles.push(fileName);
							} else {
								daqFactoryFiles.push(fileName);
							}
							countDocPerFileRunning = false;
						}

						// Get fileName and fileType variables set up	
						fileName = files.shift();
						let fileType = fileName.split(/[_]+/)[2];
						if (fileName.startsWith('TAP')) {
							fileType = 'TAP';
						}

						// Count how many lines are in the file we are looking at.
						// Used in countDocuments
						let contents = fs.readFileSync(`${folder}/${fileName}`);
						let lines = contents.toString().split('\n').length - 1;

						let doCountDoc = true;
						if (job.overwriteLiveData) {
							doCountDoc = false;
							fileTypeThenPush(fileName, fileType);
						}	

						// ALWAYS do daqFactory data.
						if (!(fileType.endsWith('met') || fileType.startsWith('TAP'))) {
							fileTypeThenPush(fileName, fileType);
							doCountDoc = false;
						}

						if (doCountDoc) {
							db.countDocuments(collectionNames.LiveData, { file: fileName }, { supressErrors: true, connectTimeoutMS: 3000, socketTimeoutMS: 3000}, (err, res) => {
								// If countDoc for file: fileName is within 10% of the number of lines are in the file, go ahead and skip this file.
								if (err || lines * .90 >= res || lines * 1.10 <= res) {
									fileTypeThenPush(fileName, fileType);
								}
								countDocPerFileRunning = false;
							});
						}
					}
				}
			}, 50); // Found 50 milliseconds to be the sweetspot for speed and reliability. This is for a 2016 PC

			/* I wish javascript were fully syncronous
		otherFiles.forEach(function(item, index) {
			logger.debug(item);
			readFile(`${folder}/${item}`)
		});
		logger.info("Doing DaqFactory files now");

		daqFactoryFiles.forEach(function(item, index) {
			logger.debug(`${item}`);
			readFile(`${folder}/${item}`);
		});
		*/
			// The below is trying to achieve what the above is doing.
			// The above would work if javascript were fully synchronous.
			// Because of javscripts or rather Node's asynchronous personality, I had to ghetto a setInterval to get this working.
			// Most of the time spent is here (or waiting for a job to be pushed).
			try {
				const jobInterval = setInterval(() => {
					try {

						// This is for the previous setInterval where we countDoc to see if livedata is populated with file dat.
						// We need to make sure that interval is complete before we move onto completing this interval
						if (!aggregateCountDocPerFileRunning) {

							// If no files are left to run, clearInterval, update job, log it, and leave.
							if (otherFiles.length === 0 && daqFactoryFiles.length === 0) { 
								logger.info(`Finished importing old data for ${site.siteName} from ${job.startEpoch} - ${job.endEpoch} ${moment.unix(job.startEpoch).format('YYYY/MM/DD HH:mm:ss')} - ${moment.unix(job.endEpoch).format('YYYY/MM/DD HH:mm:ss')}`);
								currentlyRunning = false;

								db.updateOne(collectionNames.ImportOldJob, { _id: job._id }, { $set: { jobStatus: importOldJobStatus.done } }, {});

								clearInterval(jobInterval);
							}

							// get if aggregationFunctionsRunning is true or false via store.
							// If false, go ahead and run nonDaqFactory first, then DaqFactory.
							// Continue untill completion
							if (!store.get('aggregationFunctionsRunning')) {
								if (otherFiles.length) {
									store.set('aggregationFunctionsRunning', true);
									let fileToRun = otherFiles.shift();
									readFile(`${folder}/${fileToRun}`); 
								} else if (daqFactoryFiles.length) {
									store.set('aggregationFunctionsRunning', true);
									let fileToRun = daqFactoryFiles.shift();
									readFile(`${folder}/${fileToRun}`); 
								}
							}
						}
					} catch (err) {
						logger.error(err);
						// If crash, try again essentially
						aggregationFunctionsRunning = false;
					}
				}, 100); // Found 100 milliseconds to be the sweetspot for speed and relibility. This is for a 2016 PC
			} catch (err) {
				logger.error(err);
				// if it crashes here (rare), go ahead and just let it run again
				currentlyRunning = false;
			}
		}

		// Do this deletion first because inserts into AggrData will come after this. 
		if (job.overwriteAggrData) {
			let deleteQuery = {
				$and: [
					{
						epoch: {
							$gt: job.startEpoch,
							$lt: job.endEpoch
						}
					}, {
						site: job.site
					}
				]
			};
			db.deleteMany(collectionNames.AggrData, deleteQuery, {}, () => { overwriteAggrDataRunning = false; });
		}

		if (job.overwriteLiveData) {
			let deleteQuery = {
				$and: [ 
					{
						epoch: {
							$gt: job.startEpoch,
							$lt: job.endEpoch
						}
					}, {
						site: job.site
					}
				]
			};
			// If not careful, deleteMany will delete newly imported data. Need to ensure that old data is completely wiped before inserts
			// That is why insertionFunction is a callback
			db.deleteMany(collectionNames.LiveData, deleteQuery, {}, insertionFunction);
		} else {
			// In case overwriteLiveData = false
			insertionFunction();
		}
	} else {
		logger.info(`No jobs to aggregate (${moment()})`);
		currentlyRunning = false;
	}
}

function interval() {
	logger.info('importing of old data now set up. Just go to the frontend and request a job!');
	currentlyRunning = false;

	// Call performOldImport before setInterval for testing purposes only. It is harmless to leave in production
	currentlyRunning = true;
	performOldImport();

	// check for jobs in importOldJob
	setInterval(() => {
		// Ensure that a old job request isn't currently being full filled.
		if (!currentlyRunning) {
			currentlyRunning = true;
			performOldImport();
		}
	}, 600); // Run every 10 minutes
}

module.exports = { interval };
