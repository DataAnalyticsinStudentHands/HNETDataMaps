import Future from 'fibers/future';
import FTPS from 'ftps';
import pathModule from 'path';
import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/votercircle:winston';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { LiveSites, Exports } from '../api/collections_both';
import { exportDataAsCSV, createTCEQData } from './fileFunctions';

// reading ftps password from environment
const hnetsftp = process.env.hnetsftp;

export const pushData = function pushData(aqsid, startEpoch, endEpoch, manualPush) {
  try {
    const data = exportDataAsCSV(aqsid, startEpoch, endEpoch, 'tceq');

    if (Object.keys(data).length === 0 && data.constructor === Object) {
      throw new Meteor.Error('pushData', 'Could not find data for selected site/period.');
    }

    const startTimeStamp = `${data.data[0].dateGMT} ${data.data[0].timeGMT}`;
    const endTimeStamp = `${_.last(data.data).dateGMT} ${_.last(data.data).timeGMT}`;

    const outputFile = createTCEQData(aqsid, data);

    const ftps = new FTPS({ host: 'ftps.tceq.texas.gov', username: 'jhflynn@central.uh.edu', password: hnetsftp, protocol: 'ftps', port: 990 });

    // Set up a future
    const fut = new Future();
    // call ftps async method
    ftps.cd('UH/c696').addFile(outputFile).exec((err, res) => {
      if (res.error) {
        fut.throw(`Error during push file: ${res.error}`);
      } else {
        logger.info(`Pushed ${outputFile} ${JSON.stringify(res)}`);
        // Return the results
        fut.return(`${outputFile}`);
      }
    });

    const result = fut.wait();
    // insert a timestamp for the pushed data
    const manualPushEpoch = moment().unix();
    Exports.insert({
      _id: `${aqsid}_${moment().unix()}`,
      pushEpoch: manualPushEpoch,
      site: aqsid,
      startEpoch: moment.utc(startTimeStamp, 'YY/MM/DD HH:mm:ss').unix(),
      endEpoch: moment.utc(endTimeStamp, 'YY/MM/DD HH:mm:ss').unix(),
      fileName: result,
      manual: manualPush
    });

    LiveSites.update({
      AQSID: `${aqsid}`
    }, {
      $set: {
        lastManualPushEpoch: manualPushEpoch
      }
    });

    return pathModule.basename(result);
  } catch (err) {
    logger.error(err);
    throw new Meteor.Error('Error during push file', err);
  }
};

// NOT BEING USED RIGHT NOW!!!!!
export const pushMultipleData = function pushMultipleData() {
  // placeholder for push files
  let outputFiles = '';
  // get sites
  const activeSites = LiveSites.find({ status: 'Active' });

  // get closest 5 min intervall
  const ROUNDING = 5 * 60 * 1000;/* ms */
  let end = moment();
  end = moment(Math.floor((+end) / ROUNDING) * ROUNDING);
  const endEpoch = moment(end).unix();

  const pushingSites = [];

  activeSites.forEach((site) => {
    // check last push not older than 1 day (24 hours)
    if (site.lastPushEpoch > moment().subtract(1, 'days').unix()) {
      const startEpoch = site.lastPushEpoch;

      const data = exportDataAsCSV(site.AQSID, startEpoch, endEpoch, 'tceq');

      if (Object.keys(data).length === 0 && data.constructor === Object) {
        logger.error('No data.', `Could not find data for automatic push ${site.siteName} ${startEpoch}/${endEpoch}.`);
      } else {
        const outputFile = createTCEQData(site.AQSID, data);
        // create entry for pushing site
        pushingSites.push({
          aqsid: site.AQSID,
          startTimeStamp: `${data.data[0].dateGMT} ${data.data[0].timeGMT}`,
          endTimeStamp: `${_.last(data.data).dateGMT} ${_.last(data.data).timeGMT}`,
          outputFile
        });
        outputFiles = outputFiles.concat(`${outputFile} `);

        const startTime = moment.unix(startEpoch).format('YYYY-MM-DD-HH-mm-ss');
        const endTime = moment.unix(endEpoch).format('YYYY-MM-DD-HH-mm-ss');
        logger.info(`created automatic pushfile for AQSID: ${site.AQSID} ${site.siteName}, startEpoch: ${startEpoch}, endEpoch: ${endEpoch}, startTime: ${startTime}, endTime: ${endTime}`);
      }
    }
  });

  if (pushingSites.length !== 0) {
    // setup for push data to TCEQ
    const ftps = new FTPS({
      host: 'ftps.tceq.texas.gov',
      username: 'jhflynn@central.uh.edu',
      password: hnetsftp,
      retries: 2,
      protocol: 'ftps',
      port: 990
    });

    // Set up a future
    const fut = new Future();

    ftps.cd('UH/c696').raw(`mput ${outputFiles}`).exec((err, res) => {
      if (res.error) {
        logger.error('Error during automatic push:', res.error);
        fut.throw(`Error during push file: ${res.error}`);
      } else {
        const pushEpoch = moment().unix();
        logger.info(`Pushed multiple ${outputFiles} ${JSON.stringify(res)}`);
        // Return the results
        fut.return(pushEpoch);
      }
    });

    try {
      const result = fut.wait();

      pushingSites.forEach((site) => {
        // update last push epoch for each site
        LiveSites.update({
          AQSID: site.aqsid
        }, {
          $set: {
            lastPushEpoch: result
          }
        }, { validate: false });

        // insert a timestamp for the pushed data
        Exports.insert({
          _id: `${site.aqsid}_${moment().unix()}`,
          pushEpoch: result,
          site: site.aqsid,
          startEpoch: moment.utc(site.startTimeStamp, 'YY/MM/DD HH:mm:ss').unix(),
          endEpoch: moment.utc(site.endTimeStamp, 'YY/MM/DD HH:mm:ss').unix(),
          fileName: site.outputFile,
          manual: false
        });
      });
    } catch (err) {
      throw new Meteor.Error('Error during push file', err);
    }
  }
};
