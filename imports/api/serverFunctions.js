/* This file is to abstract the mongo connection, and functionality.
 * This allows simple one liner calls to these functions and it will just work.
 */

/*
import { dbName, dburl } from '../startup/server/startup.js';
import { logger } from '../startup/startup-logger.js';
*/
// library
const mongodb = require('mongodb');

// Program functions
const dbName = require('../startup').dbName;
const dburl = require('../startup').dburl;

const logger = require('../startup/startup-logger').logger;

/*
 * Old meteor way of connecting to collections
// all air monitoring sites pushing to us
export const LiveSites = new Mongo.Collection('livesites');

// live data pushed to our server
export const LiveData = new Mongo.Collection('livedata');

// aggregated data produced by our server
export const AggrData = new Mongo.Collection('aggregatedata5min');

// collection used to start the importing of old data in mongodb
export const ImportOldJob = new Mongo.Collection('importOldJob');
*/

const collectionNames = {
	LiveSites : 'livesites',
	LiveData : 'livedata',       
	AggrData : 'aggregatedata5min',
	ImportOldJob : 'importOldJob'
};

const MongoClient = mongodb.MongoClient;

const defaultOptions = { useUnifiedTopology: true, useNewUrlParser: true };

function supressErrorsValue(options) {
	return (options.supressErrors !== undefined && options.supressErrors !== null) && options.supressErrors;
}

/*
Abstracted bulkWrite for mongodb.
All it needs are the three variables and you are good
Bulk write is different than the rest. 
Read: https://docs.mongodb.com/drivers/node/usage-examples/bulkWrite/
To use, it requires some setting up of the array of JSON objects.
If you understand how they structured the JSON objects, you'll understand how to use this function
*/
async function bulkWrite(collectionName, query, options, callback) {
	if (options === null || options === undefined) {
		options = {};
	}
	Object.assign(options, options, defaultOptions);

	let supressErrors = supressErrorsValue(options);

	try {
		await MongoClient.connect(
			dburl,
			defaultOptions,
			function(err, client) {
				if (!supressErrors && err) logger.error(err);

				if (!err) {
					client
						.db(dbName)
						.collection(collectionName)
						.bulkWrite(query, options, function(err, res) {
							if (!supressErrors && err) logger.error(err);

							client.close();

							if (!(callback === null || callback === undefined)) {
								callback();
							}
						});
				}
			});
	} catch (err) {
		logger.error(err);
	}
	return true;
}

// Rarely used. InsertOne is a something I added because why not
async function insertOne(collectionName, query, options, callback) {
	if (options === null || options === undefined) {
		options = {};
	}
	Object.assign(options, options, defaultOptions);
	
	let supressErrors = supressErrorsValue(options);

	try {
		await MongoClient.connect(
			dburl,
			defaultOptions,
			function(err, client) {
				if (!supressErrors && err) logger.error(err);

				if (!err) {
					client
						.db(dbName)
						.collection(collectionName)
						.insertOne(query, options, function(err, res) {
							if (!supressErrors && err) logger.error(err);

							client.close();

							if (!(callback === null || callback === undefined)) {
								callback();
							}
						});
				}
			});
	} catch (err) {
		logger.error(err);
	}
}

// Just pass in the collection name, an array of objects, and your additional options, and send it.
// insertMany is as simply as that
async function insertMany(collectionName, query, options, callback) {
	if (options === null || options === undefined) {
		options = {};
	}
	Object.assign(options, options, defaultOptions);

	let supressErrors = supressErrorsValue(options);

	try {
		await MongoClient.connect(
			dburl,
			defaultOptions,
			function(err, client) {
				if (err && !supressErrors) logger.error(err);

				if (!err) {
					client
						.db(dbName)
						.collection(collectionName)
						.insertMany(query, options, function(err, res) {
							if (err && !supressErrors) logger.error(err);

							client.close();

							if (!(callback === null || callback === undefined)) {
								callback();
							}
						});
				}
			});
	} catch (err) {
		logger.error(err);
	}
	return true;
}

// Abstracted find for mongodb.
// All it needs are the three paramemeters and it will return what you ask.
async function find(collectionName, query, options) {
	let foundObjects = [];

	if (options === null || options === undefined) {
		options = {};
	}
	Object.assign(options, options, defaultOptions);

	const client = new MongoClient(dburl, defaultOptions);
	try {
		await client.connect();

		const db = await client.db(dbName);
		const collection = await db.collection(collectionName);

		await collection.find(query, options).forEach(function(item) {
			foundObjects.push(item);
		});

	} catch (err) {
		logger.error(err);
	} finally {
		await client.close();
	}
	return foundObjects;
}

// Abstracted findOne for mongodb.
// All it needs are the three paramemeters and it will return what you ask.
async function findOne(collectionName, query, options) {
	let foundObject = [];

	if (options === null || options === undefined) {
		options = {};
	}
	Object.assign(options, options, defaultOptions);
	const client = new MongoClient(dburl, defaultOptions);
	try {
		await client.connect();

		const db = await client.db(dbName);
		const collection = await db.collection(collectionName);
		foundObject = await collection.findOne(query, options);
	} catch (err) {
		logger.error(err);
	} finally {
		await client.close();
	}

	return foundObject;
}

// Abstracted aggregate for mongodb.
// All it needs is a pipeline operator, and some options. Maybe a callback
async function aggregate(collectionName, pipeline, options, callback) {
	if (options === null || options === undefined) {
		options = {};
	}
	Object.assign(options, options, defaultOptions);

	let supressErrors = supressErrorsValue(options);
	try {	
		await MongoClient.connect(
			dburl,
			options,
			function(err, client) {
				if (!supressErrors && err) logger.error(err);

				if (!err) {
					client
						.db(dbName)
						.collection(collectionName)
						.aggregate(pipeline, options, function(err, res) {
							if (!supressErrors && err) logger.error(err);

							callback(err, res, () => {client.close();});
							return res;
						});
				}
			});
	} catch (err) {
		logger.error(err);

		if (!(callback === undefined || callback === null)) {
			callback(err);
		}
		return false;
	}
}

async function deleteMany(collectionName, query, options, callback) {
	if (options === null || options === undefined) {
		options = {};
	}

	let supressErrors = supressErrorsValue(options);
	Object.assign(options, options, defaultOptions);;
	try {	
		await MongoClient.connect(
			dburl,
			options,
			function(err, client) {
				if (!supressErrors && err) logger.error(err);

				if (!err) {
					client
						.db(dbName)
						.collection(collectionName)
						.deleteMany(query, options, function(err, res) {
							if (!supressErrors && err) logger.error(err);

							if (!(callback === undefined || callback === null)) {
								callback(err, res);
							}

							client.close();
						});
				}
			});
	} catch (err) {
		logger.error(err);

		if (!(callback === undefined || callback === null)) {
			callback(err);
		}
		return false;
	}
}

async function updateOne(collectionName, query, set, options, callback) {
	if (options === null || options === undefined) {
		options = {};
	}
	Object.assign(options, options, defaultOptions);

	let supressErrors = supressErrorsValue(options);

	try {
		await MongoClient.connect(
			dburl,
			options,
			function(err, client) {
				if (!supressErrors && err) logger.error(err);

				if (!err) {
					client
						.db(dbName)
						.collection(collectionName)
						.updateOne(query, set, options, function(err, res) {
							if (!supressErrors && err) logger.error(err);

							if (!(callback === undefined || callback === null)) {
								callback(err);
							}
							
							client.close();
						});
				}
			});
	} catch (err) {
		logger.error(err);
							
		if (!(callback === undefined || callback === null)) {
			callback(err);
		}

		return false;
	}
}

async function countDocuments(collectionName, query, options, callback) {
	if (options === null || options === undefined) {
		options = {};
	}
	Object.assign(options, options, defaultOptions);

	let supressErrors = supressErrorsValue(options);

	try {
		await MongoClient.connect(
			dburl,
			options,
			function(err, client) {
				if (!supressErrors && err) logger.error(err);

				if (!err) {
					client
						.db(dbName)
						.collection(collectionName)
						.countDocuments(query, options, function(err, res) {
							if (!supressErrors && err) logger.error(err);

							if (err) {
								callback(err, 0);
							} else {
								callback(err, res);
							}

							client.close();
							return res;
						});
				}
			});
	} catch (err) {
		logger.error(err);
							
		if (!(callback === undefined || callback === null)) {
			callback(err, 0);
		}

		return 0;
	}
}

module.exports = { 
	collectionNames,
	MongoClient,
	db: { bulkWrite, insertOne, insertMany, find, findOne, aggregate, deleteMany, countDocuments, updateOne }
};
