// required packages
import FTPS from 'ftps';
import pathModule from 'path';
import '../utils/helper_functions';
import { logger } from '../startup/startup';
import { LiveSites } from '../api/collections_server';

const Future = Npm.require('fibers/future');

// reading ftps password from environment
const hnetsftp = process.env.hnetsftp;

Meteor.methods({
  pushSiteData(aqsid) {
    // get site
    const site = LiveSites.findOne({ AQSID: `${aqsid}` });
    // check last push not older than 1 day (24 hours)
    if (site.lastPushEpoch > moment().subtract(1, 'days').unix()) {
      // use last pushepoch as starting point
      const startEpoch = site.lastPushEpoch;
      // try to find everything that is available until now
      const endEpoch = moment().unix();

      const data = exportDataAsCSV(aqsid, startEpoch, endEpoch, 'tceq');

      if (Object.keys(data).length === 0 && data.constructor === Object) {
        throw new Meteor.Error('No data.', 'Could not find data for selected site/period.');
      }

      const startTimeStamp = `${data.data[0].dateGMT} ${data.data[0].timeGMT}`;
      const endTimeStamp = `${_.last(data.data).dateGMT} ${_.last(data.data).timeGMT}`;

      const outputFile = createTCEQData(aqsid, data);

      const ftps = new FTPS({
        host: 'ftps.tceq.texas.gov',
        username: 'jhflynn@central.uh.edu',
        password: hnetsftp,
        protocol: 'ftps',
        port: 990
      });

      // Set up a future
      const fut = new Future();
      // call ftps async method
      ftps.cd('UH/tmp').addFile(outputFile).exec((err, res) => {
        if (res.error) {
          logger.error('Error during push file:', res.error);
          fut.throw(`Error during push file: ${res.error}`);
        } else {
          logger.info(`Pushed ${outputFile} ${JSON.stringify(res)}`);
          // Return the results
          fut.return(`${outputFile}`);
        }
      });

      try {
        const result = fut.wait();
        // insert a timestamp for the pushed data
        Exports.insert({
          _id: `${aqsid}_${moment().unix()}`,
          pushEpoch: moment().unix(),
          site: aqsid,
          startEpoch: moment.utc(startTimeStamp, 'YY/MM/DD HH:mm:ss').unix(),
          endEpoch: moment.utc(endTimeStamp, 'YY/MM/DD HH:mm:ss').unix(),
          fileName: result,
          manual: false
        });
        return pathModule.basename(result);
      } catch (err) {
        throw new Meteor.Error('Error during push file', err);
      }
    }
    return 0;
  }
});
