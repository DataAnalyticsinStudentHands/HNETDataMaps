import FTPS from 'ftps';
import Future from 'fibers/future';
import { logger } from 'meteor/votercircle:winston';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { LiveSites, Exports } from '../api/collections_server';
import { exportDataAsCSV, createTCEQPushData } from './commonFunctions';
import { hnetsftp } from '../startup/server/startup';

export const pushSiteData = function pushSiteData(aqsid) {
  try {
    // get site
    const site = LiveSites.findOne({ AQSID: `${aqsid}` });
    // check whether this site should push at all
    if (site.TCEQPushing === 'Active') {
      // check last push not older than 1 day (24 hours)
      if (site.lastPushEpoch > moment().subtract(1, 'days').unix()) {
        // use last endEpoch as starting point
        const lastPush = Exports.findOne({ pushEpoch: site.lastPushEpoch });
        let startEpoch;
        if (lastPush === undefined) {
          // or if just has been resetted
          startEpoch = site.lastPushEpoch;
        } else {
          startEpoch = lastPush.endEpoch;
          if (startEpoch === undefined) {
            // or if just has been resetted
            startEpoch = site.lastPushEpoch;
          }
        }

        // try to find everything that is available until now
        const endEpoch = moment().unix();

        logger.info(`Trying to get data for ${startEpoch} - ${endEpoch}`);

        const data = exportDataAsCSV(aqsid, startEpoch, endEpoch);

        if (Object.keys(data).length === 0 && data.constructor === Object) {
          throw new Error(`Could not find data for ${startEpoch} - ${endEpoch}`);
        }

        const startTimeStamp = `${data.data[0].dateGMT} ${data.data[0].timeGMT}`;
        const endTimeStamp = `${_.last(data.data).dateGMT} ${_.last(data.data).timeGMT}`;

        const outputFile = createTCEQPushData(aqsid, data);

        const ftps = new FTPS({ host: 'ftps.tceq.texas.gov', username: 'jhflynn@central.uh.edu', password: hnetsftp, protocol: 'ftps', port: 990 });

        // Set up a future
        const fut = new Future();
        // call ftps async method
        ftps.cd('UH/c696').addFile(outputFile).exec((err, res) => {
          if (res.error) {
            fut.throw(`Error during push file: ${res.error}`);
          } else {
            logger.info(`Automatic Push of ${outputFile} ${JSON.stringify(res)}`);
            // Return the results
            fut.return(`${outputFile}`);
          }
        });

        const result = fut.wait();
        // insert a timestamp for the pushed data
        const newLastPushEpoch = moment().unix();
        Exports.insert({
          _id: `${aqsid}_${moment().unix()}`,
          pushEpoch: newLastPushEpoch,
          site: aqsid,
          startEpoch: moment.utc(startTimeStamp, 'YY/MM/DD HH:mm:ss').unix(),
          endEpoch: moment.utc(endTimeStamp, 'YY/MM/DD HH:mm:ss').unix(),
          fileName: result,
          manual: false
        });

        // update last push epoch
        LiveSites.update({
          AQSID: aqsid
        }, {
          $set: {
            lastPushEpoch: newLastPushEpoch
          }
        });
      }
    } else {
      logger.info(`Site ${site} is turned off for automatic pushing.`);
    }
  } catch (err) {
    logger.error(err.message);
  }
};
