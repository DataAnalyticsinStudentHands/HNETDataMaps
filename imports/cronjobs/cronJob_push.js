import { Meteor } from 'meteor/meteor';
import { pushSiteData } from '../methods/pushSiteDataFunctions';
import { LiveSites } from '../api/collections_server';

// push data if site is active
Meteor.setInterval(() => {
  // get site reading aqsid from environment (*.json pm2 config file)
  const site = LiveSites.findOne({ AQSID: process.env.aqsid });

  if (site.status === 'Active') {
    pushSiteData(process.env.aqsid, false);
  }
}, 10 * 60 * 1000); // run every 10 min
