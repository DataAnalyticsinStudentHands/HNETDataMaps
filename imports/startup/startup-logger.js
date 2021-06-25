// Just allows us to use pretty colors when output stuff to console :)
const util = require('util');
const logger = {
	lastDebugDate: null, 
	lastInfoDate: null, 
	lastWarnDate: null, 
	lastErrorDate: null,
	// fullObject just allows you to ask whether you want the entire object displayed or not
	debug: function(log, fullObject = true) {
		lastDebugDate = new Date();
		if (fullObject) {
			console.log('\x1b[34m%s\x1b[0m', `debug: ${util.inspect(log, showHidden=true, depth=1000)}`);
		} else {
			console.log('\x1b[34m%s\x1b[0m', `debug: ${log}`);
		}
	},
	info: function(log, fullObject = true) {
		lastInfoDate = new Date();
		if (fullObject) {
			console.log('\x1b[32m%s\x1b[0m', `info: ${util.inspect(log, showHidden=true, depth=1000)}`);
		} else {
			console.log('\x1b[32m%s\x1b[0m', `info: ${log}`);
		}
	},
	warn: function(log, fullObject = true) {
		lastWarnDate = new Date();
		if (fullObject) {
			console.log('\x1b[33m%s\x1b[0m', `warning: ${util.inspect(log, showHidden=true, depth=1000)}`);
		} else {
			console.log('\x1b[33m%s\x1b[0m', `warning: ${log}`);
		}
	},
	error: function(log, fullObject = true) {
		lastErrorDate = new Date();
		if (fullObject) {
			console.log('\x1b[31m\x1b[1m%s\x1b[0m', `error: ${util.inspect(log, showHidden=true, depth=1000)}`);
		} else {
			console.log('\x1b[31m\x1b[1m%s\x1b[0m', `error: ${log}`);
		}
	}
};

module.exports = { logger };
