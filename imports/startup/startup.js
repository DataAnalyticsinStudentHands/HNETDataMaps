import fs from 'fs-extra';
import { Meteor } from 'meteor/meteor';
import { LiveSites } from '../api/collections_server';
import winston from 'winston';

// Setting up Winston logger
const console = new winston.transports.Console({ name: 'console', timestamp: true });
export const logger = new winston.Logger({ transports: [console] });

// Setting up directory in which this server expects incoming files (uses an environment variable)
export const globalsite = LiveSites.findOne({ AQSID: `${process.env.aqsid}` });

Meteor.startup(function() {
  // Insert sample data if the live site collection is empty
  if (LiveSites.find().count() === 0) {
    JSON.parse(Assets.getText('livesites.json')).site.forEach(function(doc) {
      LiveSites.insert(doc);
    });
  }

  // Create directory for outgoing files for tomorrow
  fs.mkdirs(`/hnet/outgoing/${moment().year()}/${moment().month() + 1}/${moment().date() + 1}`, function(err) {
    if (err) {
      winston.error(err);
    }
  });
});
