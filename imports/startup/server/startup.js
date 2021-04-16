import fs from 'fs-extra';
import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/votercircle:winston';
import { moment } from 'meteor/momentjs:moment';
import { LiveSites } from '../../api/collections_server';

// Setting up directory in which this server expects incoming files (uses an environment variable)

// This should have been here from the beginning
// Ensure that environment variable aqsid is defined
if (typeof process.env.aqsid==="undefined") {
  throw new Error("Environment variable aqsid not defined.");
}

export const globalsite = LiveSites.findOne({ AQSID: `${process.env.aqsid}` });

// reading ftps password from environment
export const hnetsftp = process.env.hnetsftp;

logger.info(`This instance is for AQSID ${process.env.aqsid} - ${globalsite.siteName}`);

// Ensures outgoingDir is defined, else throw an error
if (typeof process.env.outgoingDir === "undefined") {
  throw new Error("Environment variable outgoingDir not defined.");
} else if (process.env.outgoingDir === '') {
  throw new Error("Environment variable outgoingDir defined with empty string.");
}

// Ensures that only one backslash will be at the end of the outgoingDir variable.
let outgoingDir = process.env.outgoingDir;
if (outgoingDir.charAt(outgoingDir.length-1) !== '/')
  outgoingDir = outgoingDir+'/';
if (outgoingDir !== "/hnet/outgoing/") {
  console.log("Debug outgoing dir selected. For production, set outgoingDir='/hnet/outgoing/' in your environment.");
}

Meteor.startup(() => {
  // Create directory for outgoing files for tomorrow
  fs.mkdirs(`${outgoingDir}${moment().year()}/${moment().month() + 1}/${moment().date() + 1}`, (err) => {
    if (err) {
      logger.error(err);
    }
  });
});
