// Setting up directory in which this server expects incoming files (uses an environment variable)
const dburl = process.env.MONGO_URL;
const dbName = process.env.MONGO_NAME;
const globalsite = undefined;


function checkInitialEnvironmentVariables() {
	if (typeof process.env.MONGO_URL === "undefined") {
		throw new Error("environment variable 'MONGO_URL' undefined");
	}
	if (typeof process.env.MONGO_NAME === "undefined") {
		throw new Error("environment variable 'MONGO_NAME' undefined");
	}
}

module.exports = { dburl, dbName, checkInitialEnvironmentVariables, globalsite };
