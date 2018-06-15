import fs from 'fs-extra';
import FTPS from 'ftps';
import Future from 'fibers/future';
import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/votercircle:winston';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Papa } from 'meteor/harrison:papa-parse';
import { LiveSites, AggrData, Exports } from '../api/collections_server';
import { flagsHash, channelHash } from '../api/constants';

// reading ftps password from environment
const hnetsftp = process.env.hnetsftp;

// Export csv data file in defined format, default: TCEQ format
export const exportDataAsCSV = function exportDataAsCSV(aqsid, startEpoch, endEpoch) {
  const dataObject = {};

  let aggregatData;

  if (endEpoch === null) {
    aggregatData = AggrData.find({
      $and: [
        {
          epoch: {
            $in: startEpoch
          }
        }, {
          site: `${aqsid}`
        }
      ]
    }, {
      sort: {
        epoch: 1
      }
    }).fetch();
  } else {
    aggregatData = AggrData.find({
      site: `${aqsid}`,
      $and: [
        {
          epoch: {
            $gte: parseInt(startEpoch, 10)
          }
        }, {
          $and: [
            {
              epoch: {
                $lte: parseInt(endEpoch, 10)
              }
            }
          ]
        }
      ]
    }, {
      sort: {
        epoch: 1
      }
    }).fetch();
  }

  const site = LiveSites.findOne({ AQSID: `${aqsid}` });
  if (site === undefined) {
    throw new Error(`Could not find AQSID: ${aqsid} in LiveSites.`);
  }
  const channels = site.Channels;
  const activeChannels = [];
  _.each(channels, (channel) => {
    if (channel.Status === 'Active') {
      activeChannels.push(channel.Name);
    }
  });

  if (aggregatData.length !== 0) {
    dataObject.data = [];
    dataObject.fields = ['siteID', 'dateGMT', 'timeGMT', 'status']; // create fields for unparse
  }
  _.each(aggregatData, (e) => {
    const obj = {};
    const siteID = e.site.substring(e.site.length - 4, e.site.length);
    if (siteID.startsWith('0')) {
      obj.siteID = e.site.substring(e.site.length - 3, e.site.length);
    } else {
      obj.siteID = e.site.substring(e.site.length - 4, e.site.length);
    }
    obj.dateGMT = moment.utc(moment.unix(e.epoch)).format('YY/MM/DD');
    obj.timeGMT = moment.utc(moment.unix(e.epoch)).format('HH:mm:ss');
    obj.status = 0;

    Object.keys(e.subTypes).forEach((instrument) => {
      if (Object.prototype.hasOwnProperty.call(e.subTypes, instrument)) {
        const measurements = e.subTypes[instrument];
        Object.keys(measurements).forEach((measurement) => {
          if (Object.prototype.hasOwnProperty.call(measurements, measurement)) {
            if (activeChannels.includes(measurement)) { // check wheather measurement is an active channel
              let label = `${instrument}_${measurement}_channel`;
              obj[label] = channelHash[`${instrument}_${measurement}`]; // channel

              if (dataObject.fields.indexOf(label) === -1) { // add to fields?
                dataObject.fields.push(label);
              }
              const data = measurements[measurement];

              label = `${instrument}_${measurement}_flag`;
              if (dataObject.fields.indexOf(label) === -1) { // add to fields?
                dataObject.fields.push(label);
              }
              obj[label] = flagsHash[_.last(data).val].label; // Flag
              label = `${instrument}_${measurement}_value`;
              if (dataObject.fields.indexOf(label) === -1) { // add to fields?
                dataObject.fields.push(label);
              }
              // taking care of flag Q (span)
              if (flagsHash[_.last(data).val].label === 'Q') {
                obj[label] = 0; // set value to 0
              } else {
                let outputValue = data[1].val; // avg
                // HNET Unit conversion for Temp from C to F
                if (measurement === 'Temp' || measurement === 'AmbTemp') {
                  outputValue = (outputValue * 9 / 5) + 32;
                } else if (measurement === 'WS') {
                  outputValue = Math.round(outputValue * 3600 / 1610.3 * 1000) / 1000;
                }
                obj[label] = outputValue.toFixed(3);
              }
            }
          }
        });
      }
    });

    obj.QCref_channel = 50;
    obj.QCref_flag = 'K';
    obj.QCref_value = 0;
    obj.QCstatus_channel = 51;
    obj.QCstatus_flag = 'K';
    obj.QCstatus_value = 99000;
    dataObject.data.push(obj);
  });
  if (dataObject.fields !== undefined) {
    dataObject.fields.push('QCref_channel', 'QCref_flag', 'QCref_value', 'QCstatus_channel', 'QCstatus_flag', 'QCstatus_value');
  }

  return dataObject;
};

// writes a TCEQ input formatted output file to the local outgoing folder
export const createTCEQData = function createTCEQData(aqsid, data) {
  const site = LiveSites.find({ AQSID: `${aqsid}` }).fetch()[0];

  if (site === undefined) {
    throw new Meteor.Error('Could not find AQSID: ', aqsid, ' in LiveSites.');
  }

  // create site name from incoming folder
  const siteName = (site.incoming.match(new RegExp('UH' +
  '(.*)' +
  '_')))[1].slice(-2);
  // ensure whether output dir exists
  const outputDir = `/hnet/outgoing/${moment().year()}/${moment().month() + 1}/${moment().date()}`;
  fs.ensureDirSync(outputDir, (err) => {
    return logger.error(err); // => null
    // outputdir has now been created, including the directory it is to be placed in
  });
  // create csv file and store in outgoing folder
  const outputFile = `${outputDir}/${siteName.toLowerCase()}${moment.utc().format('YYMMDDHHmmss')}.uh`;
  const csvComplete = Papa.unparse({ data: data.data, fields: data.fields });
  // removing header from csv string
  const n = csvComplete.indexOf('\n');
  const csv = csvComplete.substring(n + 1);

  try {
    fs.writeFileSync(outputFile, csv);
    return outputFile;
  } catch (error) {
    logger.error('Could not write TCEQ push file.', `Could not write TCEQ push file. Error: ${error}`);
    throw new Meteor.Error('Could not write TCEQ push file.', `Could not write TCEQ push file. Error: ${error}`);
  }
};

export const pushSiteData = function pushSiteData(aqsid) {
  try {
    // get site
    const site = LiveSites.findOne({ AQSID: `${aqsid}` });
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

      const outputFile = createTCEQData(aqsid, data);

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
  } catch (err) {
    logger.error(err.message);
  }
};
