// required packages
import fs from 'fs-extra';
import FTPS from 'ftps';
import pathModule from 'path';

import { LiveSites } from '../api/collections_both';

const Future = Npm.require('fibers/future');

// reading ftps password from environment
const hnetsftp = process.env.hnetsftp;

Meteor.methods({
  loadFile(path) {
    var fut = new Future();

    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        logger.error(err);
        fut.throw(err);
      } else {
        fut.return(data);
      }
    });

    const fileData = fut.wait();

    return fileData;
  },
  exportData(aqsid, startEpoch, endEpoch, fileFormat) {
    const data = exportDataAsCSV(aqsid, startEpoch, endEpoch, fileFormat);

    if (Object.keys(data).length === 0 && data.constructor === Object) {
      throw new Meteor.Error('No data.', 'Could not find data for selected site/period.');
    }

    return data;
  },
  deleteAggregates(aqsid, startEpoch, endEpoch) {
    return AggrData.remove({
      site: `${aqsid}`,
      $and: [
        {
          epoch: {
            $gte: parseInt(startEpoch, 10)
          }
        },
        {
          $and: [
            {
              epoch: {
                $lte: parseInt(endEpoch, 10)
              }
            }
          ]
        }
      ]
    });
  },
  pushData(aqsid, startEpoch, endEpoch, manualPush) {
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
    ftps.cd('UH/c696').addFile(outputFile).exec((err, res) => {
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
        manual: manualPush
      });
      return pathModule.basename(result);
    } catch (err) {
      throw new Meteor.Error('Error during push file', err);
    }
  },
  pushMultipleData() {
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

    activeSites.forEach(function(site) {
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

        pushingSites.forEach(function (site) {

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
  },
  pushEdits(aqsid, pushPointsEpochs) {
    const startEpoch = pushPointsEpochs[0];
    const endEpoch = _.last(pushPointsEpochs);
    const data = exportDataAsCSV(aqsid, pushPointsEpochs, null, 'tceq');

    if (data === undefined) {
      throw new Meteor.Error('Could not find data for selected period.');
    }

    const pushFile = createTCEQData(aqsid, data);

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
    ftps.cd('UH/c696').addFile(pushFile).exec((err, res) => {
      if (res.error) {
        logger.error('Error during push edits file:', res.error);
        fut.throw(`Error during push edits file: ${res.error}`);
      } else {
        logger.info(`Pushed Edit ${pushFile} ${JSON.stringify(res)}`);
        // Return the results
        fut.return(`${pushFile}`);
      }
    });

    try {
      const result = fut.wait();
      // update edit data points with push date
      const points = AggrEdits.find({
        "startEpoch": {
          $gte: startEpoch
        },
        $and: [
          {
            "endEpoch": {
              $lte: endEpoch
            }
          }
        ]
      });

      points.forEach((point) => {
        AggrEdits.update({
          _id: point._id
        }, {
          $set: {
            fileName: pushFile
          }
        });
      });
      return pathModule.basename(result);
    } catch (err) {
      throw new Meteor.Error('Error during push file', err);
    }
  },
  insertUpdateFlag(siteId, epoch, instrument, measurement, flag, note) {
    // id that will receive the update
    const id = `${siteId}_${epoch / 1000}`; // seconds

    // new field
    const insertField = 'subTypes.' + instrument + '.' + measurement.split(/[ ]+/)[0];
    // update value
    const qry = {};
    qry.$push = {};
    qry.$push[insertField] = {};
    qry.$push[insertField].val = flag;
    qry.$push[insertField].metric = 'Overwrite Flag';
    qry.$push[insertField].user = Meteor.user().emails[0].address; // user doing the edit
    qry.$push[insertField].note = note;
    qry.$push[insertField].epoch = moment().unix();

    AggrData.update({
      _id: id
    }, qry);
  },
  insertEdits(editedPoints, flag, note) {
    // id that will be created
    const firstPoint = editedPoints[0];
    const editEpoch = moment().unix();
    const id = `${firstPoint.site}_${editEpoch}`; // seconds

    const newEdit = {};
    newEdit._id = id;
    newEdit.editEpoch = editEpoch;
    newEdit.startEpoch = firstPoint.x / 1000;
    newEdit.endEpoch = editedPoints[editedPoints.length - 1].x / 1000;
    newEdit.site = firstPoint.site;
    newEdit.instrument = firstPoint.instrument;
    newEdit.flag = flag;
    newEdit.user = Meteor.user().emails[0].address; // user doing the edit
    newEdit.note = note;
    newEdit.pushed = '';
    newEdit.editedPoints = editedPoints;

    AggrEdits.insert(newEdit);
  },
  // reste the last push epoch for a site
  resetLastPushDate(aqsid) {
    // get closest 5 min intervall
    const ROUNDING = 5 * 60 * 1000;/* ms */
    let now = moment();
    now = moment(Math.floor((+ now) / ROUNDING) * ROUNDING);

    LiveSites.update({
      // Selector
      AQSID: `${aqsid}`
    }, {
      // Modifier
      $set: {
        lastPushEpoch: moment(now).unix()
      }
    }, {validate: false});
    logger.info(`Reset last push epoch called for ${aqsid}`);
  }
});
