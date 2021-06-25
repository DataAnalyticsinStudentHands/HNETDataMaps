const checkInitialEnvironmentVariables = require('./imports/startup/server/startup').checkInitialEnvironmentVariables;
const logger = require('./imports/startup/startup-logger').logger;
const interval = require('./imports/methods/oldfeedFunctions.js').interval;

// Works for Date format. Not epoch unless you change it to milliseconds.
function getDifferenceInDays(date1, date2) {
  const diffInMs = Math.abs(date2 - date1);
  return diffInMs / (1000 * 60 * 60 * 24);
}

// This is to ensure it never gets stuck. 
// Occasionally, it does and I don't feel like debugging it.
// This is due to it's random nature of getting stuck.
// Forcing it to restart whenever a logger.info, error, or warn hasn't printed to console in 3 days is much easier.
setInterval(() => {
	let currDate = new Date();
	if (
		(logger.lastInfoDate === null || getDifferenceInDays(currDate, logger.lastInfoDate) > 0) &&
		(logger.lastWarnDate === null || getDifferenceInDays(currDate, logger.lastWarnDate) > 0) &&
		(logger.lastErrorDate === null || getDifferenceInDays(currDate, logger.lastErrorDate) > 0)
	) {
		throw new Error("Nothing has been logged in 3 days. Potentially stuck. Forcing restart.");
	}
}, 100000);

checkInitialEnvironmentVariables();
interval();
