// required packages
import fs from 'fs-extra';
import { logger } from '../startup/startup';
import { LiveSites, AggrData } from '../api/collections_both';

/*
 * Export csv data file in defined format, default: TCEQ format
 */
function exportDataAsCSV(aqsid, startEpoch, endEpoch, fileFormat) {
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
      ] }, {
        sort: {
          epoch: 1
        }
      }).fetch();
  }

  switch (fileFormat) {
    case 'raw':
      logger.error('raw export format not yet implemented.');
      break;
    case 'tceq_allchannels':
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

        for (const instrument in e.subTypes) {
          if (e.subTypes.hasOwnProperty(instrument)) {
            const measurements = e.subTypes[instrument];
            for (const measurement in measurements) {
              if (measurements.hasOwnProperty(measurement)) {
                let label = `${instrument}_${measurement}_channel`;
                obj[label] = channelHash[instrument + '_' + measurement]; // channel

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
                    outputValue = outputValue * 9 / 5 + 32;
                  } else if (measurement === 'WS') {
                    outputValue = Math.round(outputValue * 3600 / 1610.3 * 1000) / 1000;
                  }
                  obj[label] = outputValue.toFixed(3);
                }
              }
            }
          }
        }

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
      break;
    case 'tceq':
      const site = LiveSites.findOne({AQSID: `${aqsid}`});
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

        for (const instrument in e.subTypes) {
          if (e.subTypes.hasOwnProperty(instrument)) {
            const measurements = e.subTypes[instrument];
            for (const measurement in measurements) {
              if (measurements.hasOwnProperty(measurement)) {
                if (activeChannels.includes(measurement)) { // check wheather measurement is an active channel
                  let label = `${instrument}_${measurement}_channel`;
                  obj[label] = channelHash[instrument + '_' + measurement]; // channel

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
                    // Unit conversion for Temp from C to F
                    if (measurement === 'Temp' || measurement === 'AmbTemp') {
                      outputValue = outputValue * 9 / 5 + 32;
                    } else if (measurement === 'WS') {
                      outputValue = Math.round(outputValue * 3600 / 1610.3 * 1000) / 1000;
                    }
                    obj[label] = outputValue.toFixed(3);
                  }
                }
              }
            }
          }
        }

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
      break;
    default:
      throw new Meteor.Error('Unexpected switch clause', 'exception in switch statement for export file format');
  }
  return dataObject;
}

function createTCEQData(aqsid, data) {
  if (typeof (hnetsftp) === 'undefined') {
    // hnetsftp environment variable doesn't exists
    return logger.error('No password found for hnet sftp.');
  }

  const site = LiveSites.find({ AQSID: `${aqsid}` }).fetch()[0];

  if (site === undefined) {
    return logger.error('Could not find dir for AQSID: ', aqsid, ' in LiveSites.');
  }

  // create site name from incoming folder
  const siteName = (site.incoming.match(new RegExp('UH' +
  '(.*)' +
  '_')))[1].slice(-2);
  // ensure whether output dir exists
  const outputDir = `/hnet/outgoing/${moment().year()}/${moment().month() + 1}/${moment().date()}`;
  fs.ensureDirSync(outputDir, function (err) {
    return logger.error(err); // => null
    // outputdir has now been created, including the directory it is to be placed in
  });
  // create csv file and store in outgoing folder
  const outputFile = `${outputDir}/${siteName.toLowerCase()}${moment.utc().format('YYMMDDHHmmss')}.uh`;
  const csvComplete = Papa.unparse({
    data: data.data,
    fields: data.fields
  });
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
}
