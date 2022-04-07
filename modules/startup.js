// Setting up mongodb and aqsid
export const dburl = process.env.MONGO_URL;
export const aqsid = process.env.AQSID;

// checking whetehr the required environment variables are defined
export default function checkInitialEnvironmentVariables() {
	if (typeof process.env.MONGO_URL === "undefined") {
		throw new Error("environment variable 'MONGO_URL' undefined");
	}
	if (typeof process.env.AQSID === "undefined") {
		throw new Error("environment variable 'AQSID' undefined");
	}
}
