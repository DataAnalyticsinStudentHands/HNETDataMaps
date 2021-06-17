/* Old meteor startup code
import '../imports/startup/startup-logger';
import '../imports/startup/server/startup';
import '../imports/methods/oldfeedFunctions';
*/

// import { checkInitialEnvironmentVariables } from './imports/startup/server/startup.js';
// import { logger } from './imports/startup/startup-logger.js';
// import { interval } from './imports/methods/oldfeedFunctions.js';
const checkInitialEnvironmentVariables = require('./imports/startup/server/startup').checkInitialEnvironmentVariables;
const logger = require('./imports/startup/startup-logger').logger;
const interval = require('./imports/methods/oldfeedFunctions.js').interval;

checkInitialEnvironmentVariables();
interval();
