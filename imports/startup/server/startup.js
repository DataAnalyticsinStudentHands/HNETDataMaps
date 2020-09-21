import fs from 'fs-extra';
import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/votercircle:winston';
import { moment } from 'meteor/momentjs:moment';
import { LiveSites } from '../../api/collections_server';

// Setting up directory in which this server expects incoming files (uses an environment variable)
export const globalsite = LiveSites.findOne({ AQSID: `${process.env.aqsid}` });

// reading ftps password from environment
export const hnetsftp = process.env.hnetsftp;

logger.info(`This instance is for AQSID ${process.env.aqsid} - ${globalsite.siteName}`);

Meteor.startup(() => {
  // Create directory for outgoing files for tomorrow
  fs.mkdirs(`/hnet/outgoing/${moment().year()}/${moment().month() + 1}/${moment().date() + 1}`, (err) => {
    if (err) {
      logger.error(err);
    }
  });
});
