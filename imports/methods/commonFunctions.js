// These are functions that are the same for the front-end and backend. If changes are being made, they should be pulled over.
import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import { logger } from 'meteor/votercircle:winston';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Papa } from 'meteor/harrison:papa-parse';
import { bulkCollectionUpdate } from 'meteor/udondan:bulk-collection-update';
import fs from 'fs-extra';
import pathModule from 'path';
import { AggrData, LiveData, LiveSites } from '../api/collections_both';
import { channelHash, flagsHash } from '../api/constants';

// Export csv data file in defined format, default: TCEQ format
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

        Object.keys(e.subTypes).forEach((instrument) => {
          if (Object.prototype.hasOwnProperty.call(e.subTypes, instrument)) {
            const measurements = e.subTypes[instrument];
            Object.keys(measurements).forEach((measurement) => {
              if (Object.prototype.hasOwnProperty.call(measurements, measurement)) {
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
      break;
    case 'tceq': {
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
      break;
    }
    default:
      throw new Meteor.Error('Unexpected switch clause', 'exception in switch statement for export file format');
  }
  return dataObject;
}

// performs the creation of 5 minute aggregate data points
function perform5minAggregat(siteId, startEpoch, endEpoch) {
  logger.info(`Called 5minAgg for site: ${siteId} start: ${startEpoch} end: ${endEpoch}`);
  // create temp collection as placeholder for aggreagation results
  const aggrResultsName = `aggr${moment().valueOf()}`;
  const AggrResults = new Meteor.Collection(aggrResultsName);

  // gather all data, group by 5min epoch
  const pipeline = [
    {
      $match: {
        $and: [
          {
            epoch: {
              $gt: parseInt(startEpoch, 10),
              $lt: parseInt(endEpoch, 10)
            }
          }, {
            site: siteId
          }
        ]
      }
    }, {
      $project: {
        epoch5min: 1,
        epoch: 1,
        site: 1,
        subTypes: 1
      }
    }, {
      $group: {
        _id: '$epoch5min',
        site: {
          $last: '$site'
        },
        subTypes: {
          $push: '$subTypes'
        }
      }
    }, {
      $out: aggrResultsName
    }
  ];

  Promise.await(LiveData.rawCollection().aggregate(pipeline, { allowDiskUse: true }).toArray());

  // create new structure for data series to be used for charts
  AggrResults.find({}).forEach((e) => {
    const subObj = {};
    subObj._id = `${e.site}_${e._id}`;
    subObj.site = e.site;
    subObj.epoch = e._id;
    const subTypes = e.subTypes;
    const aggrSubTypes = {}; // hold aggregated data

    for (let i = 0; i < subTypes.length; i++) {
      for (const subType in subTypes[i]) {
        if (subTypes[i].hasOwnProperty(subType)) {
          const data = subTypes[i][subType];
          let numValid = 1;
          var newkey;

          // if flag is not existing, put 9 as default, need to ask Jim?
          if (data[0].val === '') {
            data[0].val = 9;
          }
          if (data[0].val !== 1) { // if flag is not 1 (valid) don't increase numValid
            numValid = 0;
          }

          if (subType.indexOf('RMY') >= 0) { // HNET special calculation for wind data
            // get windDir and windSpd
            let windDir;
            let windSpd;
            let windDirUnit;
            let windSpdUnit;
            for (let j = 1; j < data.length; j++) {
              if (data[j].val === '' || isNaN(data[j].val)) { // taking care of empty or NaN data values
                numValid = 0;
              }
              if (data[j].metric === 'WD') {
                windDir = data[j].val;
                windDirUnit = data[j].unit;
              }
              if (data[j].metric === 'WS') {
                windSpd = data[j].val;
                windSpdUnit = data[j].unit;
              }
            }

            // Convert wind speed and wind direction waves into wind north and east component vectors
            const windNord = Math.cos(windDir / 180 * Math.PI) * windSpd;
            const windEast = Math.sin(windDir / 180 * Math.PI) * windSpd;

            let flag = data[0].val;

            if (flag !== 1) { // if flag is not 1 (valid) don't increase numValid
              numValid = 0;
            }

            // automatic flagging of high wind speed values/flag with 9(N)
            if (windSpd >= 35) {
              numValid = 0;
              flag = 9;
            }

            // Aggregate data points
            newkey = subType + '_' + 'RMY';
            if (!aggrSubTypes[newkey]) {
              aggrSubTypes[newkey] = {
                sumWindNord: windNord,
                sumWindEast: windEast,
                avgWindNord: windNord,
                avgWindEast: windEast,
                numValid: numValid,
                totalCounter: 1, // initial total counter
                flagstore: [flag], // store all incoming flags in case we need to evaluate
                WDunit: windDirUnit, // use units from last data point in the aggregation
                WSunit: windSpdUnit // use units from last data point in the aggregation
              };
            } else {
              if (numValid !== 0) { // taking care of empty data values
                aggrSubTypes[newkey].numValid += numValid;
                aggrSubTypes[newkey].sumWindNord += windNord; // holds sum until end
                aggrSubTypes[newkey].sumWindEast += windEast;
                aggrSubTypes[newkey].avgWindNord = aggrSubTypes[newkey].sumWindNord / aggrSubTypes[newkey].numValid;
                aggrSubTypes[newkey].avgWindEast = aggrSubTypes[newkey].sumWindEast / aggrSubTypes[newkey].numValid;
              }
              aggrSubTypes[newkey].totalCounter += 1; // increase counter
              aggrSubTypes[newkey].flagstore.push(flag); // store incoming flag
            }
          } else { // normal aggreagation for all other subTypes
            for (let j = 1; j < data.length; j++) {
              newkey = subType + '_' + data[j].metric;

              if (data[j].val === '' || isNaN(data[j].val)) { // taking care of empty or NaN data values
                numValid = 0;
              }

              const flag = data[0].val;

              if (flag !== 1) { // if flag is not 1 (valid) don't increase numValid
                numValid = 0;
              }

              if (!aggrSubTypes[newkey]) {
                if (numValid === 0) {
                  data[j].val = 0;
                }

                aggrSubTypes[newkey] = {
                  sum: Number(data[j].val),
                  'avg': Number(data[j].val),
                  'numValid': numValid,
                  'totalCounter': 1, // initial total counter
                  'flagstore': [flag], // store all incoming flags in case we need to evaluate
                  unit: data[j].unit // use unit from first data point in aggregation
                };
              } else {
                if (numValid !== 0) { // keep aggregating only if numValid
                  aggrSubTypes[newkey].numValid += numValid;
                  aggrSubTypes[newkey].sum += Number(data[j].val); // holds sum until end
                  if (aggrSubTypes[newkey].numValid !== 0) {
                    aggrSubTypes[newkey].avg = aggrSubTypes[newkey].sum / aggrSubTypes[newkey].numValid;
                  }
                }
                aggrSubTypes[newkey].totalCounter += 1; // increase counter
                aggrSubTypes[newkey].flagstore.push(flag); // /store incoming flag
              }
              numValid = 1; // reset numvalid
            }
          }
        }
      }
    }

    // transform aggregated data to generic data format using subtypes etc.
    const newaggr = {};
    for (const aggr in aggrSubTypes) {
      if (aggrSubTypes.hasOwnProperty(aggr)) {
        const split = aggr.lastIndexOf('_');
        const instrument = aggr.substr(0, split);
        const measurement = aggr.substr(split + 1);
        if (!newaggr[instrument]) {
          newaggr[instrument] = {};
        }

        const obj = aggrSubTypes[aggr]; // makes it a little bit easier

        // dealing with flags
        if ((obj.numValid / obj.totalCounter) >= 0.75) {
          obj.Flag = 1; // valid
        } else {
          // find out which flag was majority
          const counts = {};
          for (let k = 0; k < obj.flagstore.length; k++) {
            counts[obj.flagstore[k]] = 1 + (counts[obj.flagstore[k]] || 0);
          }
          const maxObj = _.max(counts, function(obj) {
            return obj;
          });
          const majorityFlag = (_.invert(counts))[maxObj];
          obj.Flag = majorityFlag;
        }

        if (measurement === 'RMY') { // special treatment for wind measurements
          if (!newaggr[instrument].WD) {
            newaggr[instrument].WD = [];
          }
          if (!newaggr[instrument].WS) {
            newaggr[instrument].WS = [];
          }
          const windDirAvg = (Math.atan2(obj.avgWindEast, obj.avgWindNord) / Math.PI * 180 + 360) % 360;
          const windSpdAvg = Math.sqrt((obj.avgWindNord * obj.avgWindNord) + (obj.avgWindEast * obj.avgWindEast));

          newaggr[instrument].WD.push({ metric: 'sum', val: 'Nan' });
          newaggr[instrument].WD.push({ metric: 'avg', val: windDirAvg });
          newaggr[instrument].WD.push({ metric: 'numValid', val: obj.numValid });
          newaggr[instrument].WD.push({ metric: 'unit', val: obj.WDunit });
          newaggr[instrument].WD.push({ metric: 'Flag', val: obj.Flag });

          newaggr[instrument].WS.push({ metric: 'sum', val: 'Nan' });
          newaggr[instrument].WS.push({ metric: 'avg', val: windSpdAvg });
          newaggr[instrument].WS.push({ metric: 'numValid', val: obj.numValid });
          newaggr[instrument].WS.push({ metric: 'unit', val: obj.WSunit });
          newaggr[instrument].WS.push({ metric: 'Flag', val: obj.Flag });
        } else { // all other measurements
          if (!newaggr[instrument][measurement]) {
            newaggr[instrument][measurement] = [];
          }

          // automatic flagging of aggregated values that are out of range for NO2 to be flagged with 9(N)
          if (instrument === '42i') {
            if (obj.avg < -0.5) {
              obj.Flag = 9;
            }
          }

          newaggr[instrument][measurement].push({ metric: 'sum', val: obj.sum });
          newaggr[instrument][measurement].push({ metric: 'avg', val: obj.avg });
          newaggr[instrument][measurement].push({ metric: 'numValid', val: obj.numValid });
          newaggr[instrument][measurement].push({ metric: 'unit', val: obj.unit });
          newaggr[instrument][measurement].push({ metric: 'Flag', val: obj.Flag });
        }
      }
    }

    subObj.subTypes = newaggr;

    AggrData.insert(subObj, function(error, result) {
      // only update aggregated values if object already exists to avoid loosing edited data flags
      if (result === false) {
        Object.keys(newaggr).forEach(function(newInstrument) {
          Object.keys(newaggr[newInstrument]).forEach(function(newMeasurement) {
            // test whether aggregates for this instrument/measurement already exists
            const qry = {};
            qry._id = subObj._id;
            qry[`subTypes.${newInstrument}.${newMeasurement}`] = { $exists: true };

            if (AggrData.findOne(qry) === undefined) {
              const newQuery = {};
              newQuery.epoch = subObj.epoch;
              newQuery.site = subObj.site;
              const $set = {};
              const newSet = [];
              newSet[0] = newaggr[newInstrument][newMeasurement][0];
              newSet[1] = newaggr[newInstrument][newMeasurement][1];
              newSet[2] = newaggr[newInstrument][newMeasurement][2];
              newSet[3] = newaggr[newInstrument][newMeasurement][3];
              newSet[4] = newaggr[newInstrument][newMeasurement][4];
              $set['subTypes.' + newInstrument + '.' + newMeasurement] = newSet;

              // add aggregates for new instrument/mesaurements
              AggrData.findAndModify({
                query: newQuery,
                update: {
                  $set: $set
                },
                upsert: false,
                new: true
              });
            } else {
              const query0 = {};
              query0._id = subObj._id;
              query0[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'sum';
              const $set0 = {};
              $set0[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][0].val;
              AggrData.update(query0, { $set: $set0 });
              const query1 = {};
              query1._id = subObj._id;
              query1[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'avg';
              const $set1 = {};
              $set1[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][1].val;
              AggrData.update(query1, { $set: $set1 });
              const query2 = {};
              query2._id = subObj._id;
              query2[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'numValid';
              const $set2 = {};
              $set2[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][2].val;
              AggrData.update(query2, { $set: $set2 });
              const query3 = {};
              query3._id = subObj._id;
              query3[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'unit';
              const $set3 = {};
              $set3[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][3].val;
              AggrData.update(query3, { $set: $set3 });
              const query4 = {};
              query4._id = subObj._id;
              query4[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'Flag';
              const $set4 = {};
              $set4[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][4].val;
              AggrData.update(query4, { $set: $set4 });
            }
          });
        });
      }
    });
  });
  // drop temp collection that was placeholder for aggreagation results
  AggrResults.rawCollection().drop();
}

// creates objects from input files that are following HNET format
function makeObj(keys, startIndex, previousObject) {
  const obj = {};
  obj.subTypes = {};
  let metron = [];
  for (const key in keys) {
    if (keys.hasOwnProperty(key)) {
            // Fix for wrong headers _Wind
      let newKey = key;
      if (key.indexOf('_Wind') >= 0) {
        newKey = key.replace('_Wind', '');
      }
      const subKeys = newKey.split('_'); // split each column header
      if (subKeys.length > startIndex) { // skipping e.g. 'TheTime'
        metron = subKeys[2]; // instrument i.e. Wind, Ozone etc.
        const measurement = subKeys[3]; // measurement conc, temp, etc.
        const value = keys[key];
        let unitType = 'NA';
        if (subKeys[4] !== undefined) {
          unitType = subKeys[4]; // unit
        }

        if (!obj.subTypes[metron]) {
          obj.subTypes[metron] = [
            {
              metric: measurement,
              val: value,
              unit: unitType
            }
          ];
        } else if (measurement === 'Flag') { // Flag should be always first
          obj.subTypes[metron].unshift({ metric: measurement, val: value });
        } else {
          obj.subTypes[metron].push({ metric: measurement, val: value, unit: unitType });
        }
      }
    }
  }

  for (const subType in obj.subTypes) {
    if (obj.subTypes.hasOwnProperty(subType)) {
      // fix automatic flagging of 03 values to be flagged with 9(N)
      if (subType === 'O3' || subType === '49i') {
                // condition: O3 value above 250
        if (obj.subTypes[subType][1].val > 250) {
          obj.subTypes[subType][0].val = 9;
        }
        // if a O3 value changes for more than 30 ppb from previous value
        if (previousObject) {
          const diff = obj.subTypes[subType][1].val - previousObject.subTypes[subType][1].val;
          if (diff >= 30) {
            obj.subTypes[subType][0].val = 9;
          }
        }
      }
      // fix for RH values
      if (subType === 'TRH' || subType === 'HMP60') {
                // find index for RH channel
        let rhIndex = 0;
        obj.subTypes[subType].forEach((item, index) => {
          if (item.metric === 'RH') {
            rhIndex = index;
          }
        });
        // condition: RH value < 1 -> set to 100
        if (obj.subTypes[subType][rhIndex].metric === 'RH' && obj.subTypes[subType][rhIndex].val.length !== 0 && obj.subTypes[subType][rhIndex].val < 1) {
          obj.subTypes[subType][rhIndex].val = 100;
        }
        // condition: prevoius RH value - current RH > 15 -> set to 100
        if (previousObject) {
          if (obj.subTypes[subType][rhIndex].metric === 'RH' && ((obj.subTypes[subType][rhIndex].val - previousObject.subTypes[subType][rhIndex].val) > 15)) {
            obj.subTypes[subType][rhIndex].val = 100;
          }
        }
      }
    }
  }

  return obj;
}

// writes a TCEQ input formatted output file to the local outgoing folder
function createTCEQPushData(aqsid, data) {
  const site = LiveSites.find({ AQSID: `${aqsid}` }).fetch()[0];

  if (site === undefined) {
    throw new Meteor.Error('Could not find AQSID: ', aqsid, ' in LiveSites.');
  }

  // get site name from incoming folder
  const siteName = site.incoming.split(/[_]+/)[1];
  // ensure whether output dir exists
  const outputDir = `/hnet/outgoing/${moment().year()}/${moment().month() + 1}/${moment().date()}`;
  fs.ensureDirSync(outputDir, (err) => {
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

const callToBulkUpdate = Meteor.bindEnvironment((allObjects, path, site, startEpoch, endEpoch) => {
  // using bulkCollectionUpdate
  bulkCollectionUpdate(LiveData, allObjects, {
    callback: function() {
      logger.info(`LiveData imported from: ${path} for: ${site.siteName}`);
      perform5minAggregat(site.AQSID, startEpoch, endEpoch);
    }
  });
});

const batchLiveDataUpsert = Meteor.bindEnvironment((parsedLines, path) => {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({ incoming: parentDir });

  if (site.AQSID) {
    // create objects from parsed lines
    const allObjects = [];
    let previousObject = {};
    for (let k = 0; k < parsedLines.length; k++) {
      let singleObj = {};
      if (k === 0) {
        singleObj = makeObj(parsedLines[k], 1);
      } else {
        singleObj = makeObj(parsedLines[k], 1, previousObject);
      }
      let epoch = ((parsedLines[k].TheTime - 25569) * 86400) + (6 * 3600);
      epoch -= (epoch % 1); // rounding down
      singleObj.epoch = epoch;
      singleObj.epoch5min = epoch - (epoch % 300);
      singleObj.theTime = parsedLines[k].TheTime;
      singleObj.site = site.AQSID;
      singleObj.file = pathArray[pathArray.length - 1];
      singleObj._id = `${site.AQSID}_${epoch}`;
      allObjects.push(singleObj);
      previousObject = singleObj;
    }

    // prepare for call to bulk update and aggregation
    let startEpoch = ((parsedLines[0].TheTime - 25569) * 86400) + (6 * 3600);
    startEpoch -= (startEpoch % 1); // rounding down
    let endEpoch = ((parsedLines[parsedLines.length - 1].TheTime - 25569) * 86400) + (6 * 3600);
    endEpoch -= (endEpoch % 1); // rounding down
    callToBulkUpdate(allObjects, path, site, startEpoch, endEpoch);
  }
});

const batchMetDataUpsert = Meteor.bindEnvironment((parsedLines, path) => {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({ incoming: parentDir });

  if (site.AQSID) {
    // update the timestamp for the last update for the site
    const stats = fs.statSync(path);
    const fileModified = moment(Date.parse(stats.mtime)).unix(); // from milliseconds into moments and then epochs
    if (site.lastUpdateEpoch < fileModified) {
      LiveSites.update({
        // Selector
        AQSID: `${site.AQSID}`
      }, {
        // Modifier
        $set: {
          lastUpdateEpoch: fileModified
        }
      }, { validate: false });
    }

    // create objects from parsed lines
    const allObjects = [];
    for (let k = 0; k < parsedLines.length; k++) {
      const singleObj = {};
      singleObj.subTypes = {};
      singleObj.subTypes.TRH = [];
      singleObj.subTypes.Baro = [];
      singleObj.subTypes.RMY = [];
      singleObj.subTypes.Rain = [];

      singleObj.subTypes.TRH[0] = {};
      singleObj.subTypes.TRH[0].metric = 'Flag';
      singleObj.subTypes.TRH[0].val = 1;
      singleObj.subTypes.TRH[1] = {};
      singleObj.subTypes.TRH[1].metric = 'Temp';
      singleObj.subTypes.TRH[1].val = parsedLines[k][2];
      singleObj.subTypes.TRH[1].unit = 'C';
      singleObj.subTypes.TRH[2] = {};
      singleObj.subTypes.TRH[2].metric = 'RH';
      // fix for RH values
      // condition: RH value < 1 -> set to 100
      if (parsedLines[k][3] < 1) {
        singleObj.subTypes.TRH[2].val = 100;
      } else {
        // condition: prevoius RH value - current RH > 15 -> set to 100
        if (k > 0) {
          if ((parsedLines[k][3] - parsedLines[k - 1][3]) > 15) {
            singleObj.subTypes.TRH[2].val = 100;
          } else {
            singleObj.subTypes.TRH[2].val = parsedLines[k][3];
          }
        }
        singleObj.subTypes.TRH[2].val = parsedLines[k][3];
      }
      singleObj.subTypes.TRH[2].unit = 'pct';

      singleObj.subTypes.Baro[0] = {};
      singleObj.subTypes.Baro[0].metric = 'Flag';
      singleObj.subTypes.Baro[0].val = 1;
      singleObj.subTypes.Baro[1] = {};
      singleObj.subTypes.Baro[1].metric = 'Press';
      singleObj.subTypes.Baro[1].val = parsedLines[k][4];
      singleObj.subTypes.Baro[1].unit = 'mbar';

      singleObj.subTypes.RMY[0] = {};
      singleObj.subTypes.RMY[0].metric = 'Flag';
      singleObj.subTypes.RMY[0].val = 1;
      singleObj.subTypes.RMY[1] = {};
      singleObj.subTypes.RMY[1].metric = 'WS';
      singleObj.subTypes.RMY[1].val = parsedLines[k][6];
      singleObj.subTypes.RMY[1].unit = 'ms';
      singleObj.subTypes.RMY[2] = {};
      singleObj.subTypes.RMY[2].metric = 'WD';
      singleObj.subTypes.RMY[2].val = parsedLines[k][7];
      singleObj.subTypes.RMY[2].unit = 'deg';

      singleObj.subTypes.Rain[0] = {};
      singleObj.subTypes.Rain[0].metric = 'Flag';
      singleObj.subTypes.Rain[0].val = 1;
      singleObj.subTypes.Rain[1] = {};
      singleObj.subTypes.Rain[1].metric = 'Precip';
      singleObj.subTypes.Rain[1].val = parsedLines[k][8];
      singleObj.subTypes.Rain[1].unit = 'inch';

      // add 6 hours to timestamp and then parse as UTC before converting to epoch
      const timeStamp = moment.utc(parsedLines[k][0], 'YYYY-MM-DD HH:mm:ss').add(6, 'hour');
      let epoch = timeStamp.unix();
      epoch -= (epoch % 1); // rounding down
      singleObj.epoch = epoch;
      singleObj.epoch5min = epoch - (epoch % 300);
      singleObj.TimeStamp = parsedLines[k][0];
      singleObj.site = site.AQSID;
      singleObj.file = pathArray[pathArray.length - 1];
      singleObj._id = `${site.AQSID}_${epoch}_met`;
      allObjects.push(singleObj);
    }

    // gathering time stamps and then call to bulkUpdate
    const startTimeStamp = moment.utc(parsedLines[0][0], 'YYYY-MM-DD HH:mm:ss').add(6, 'hour');
    let startEpoch = startTimeStamp.unix();
    startEpoch -= (startEpoch % 1); // rounding down
    const endTimeStamp = moment.utc(parsedLines[parsedLines.length - 1][0], 'YYYY-MM-DD HH:mm:ss').add(6, 'hour');
    let endEpoch = endTimeStamp.unix();
    endEpoch -= (endEpoch % 1); // rounding down
    callToBulkUpdate(allObjects, path, site, startEpoch, endEpoch);
  }
});

const batchTapDataUpsert = Meteor.bindEnvironment((parsedLines, path) => {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({ incoming: parentDir });

  if (site.AQSID) {
    // update the timestamp for the last update for the site
    const stats = fs.statSync(path);
    const fileModified = moment(Date.parse(stats.mtime)).unix(); // from milliseconds into moments and then epochs
    if (site.lastUpdateEpoch < fileModified) {
      LiveSites.update({
        // Selector
        AQSID: `${site.AQSID}`
      }, {
        // Modifier
        $set: {
          lastUpdateEpoch: fileModified
        }
      }, { validate: false });
    }

    // create objects from parsed lines
    const allObjects = [];
    for (let k = 0; k < parsedLines.length; k++) {
      const singleObj = {};
      singleObj.subTypes = {};
      singleObj.subTypes.TAP = [];

      singleObj.subTypes.TAP[0] = {};
      singleObj.subTypes.TAP[0].metric = 'Flag';
      singleObj.subTypes.TAP[0].val = 1;
      singleObj.subTypes.TAP[1] = {};
      singleObj.subTypes.TAP[1].metric = 'ActiveSpot';
      singleObj.subTypes.TAP[1].val = parsedLines[k][2];
      singleObj.subTypes.TAP[1].unit = '';
      singleObj.subTypes.TAP[2] = {};
      singleObj.subTypes.TAP[2].metric = 'RefSpot';
      singleObj.subTypes.TAP[2].val = parsedLines[k][3];
      singleObj.subTypes.TAP[2].unit = '';
      singleObj.subTypes.TAP[3] = {};
      singleObj.subTypes.TAP[3].metric = 'LPF';
      singleObj.subTypes.TAP[3].val = parsedLines[k][4];
      singleObj.subTypes.TAP[3].unit = '';
      singleObj.subTypes.TAP[4] = {};
      singleObj.subTypes.TAP[4].metric = 'AvgTime';
      singleObj.subTypes.TAP[4].val = parsedLines[k][5];
      singleObj.subTypes.TAP[4].unit = '';
      singleObj.subTypes.TAP[5] = {};
      singleObj.subTypes.TAP[5].metric = 'RedAbsCoef';
      singleObj.subTypes.TAP[5].val = parsedLines[k][6];
      singleObj.subTypes.TAP[5].unit = '';
      singleObj.subTypes.TAP[6] = {};
      singleObj.subTypes.TAP[6].metric = 'GreenAbsCoef';
      singleObj.subTypes.TAP[6].val = parsedLines[k][7];
      singleObj.subTypes.TAP[6].unit = '';
      singleObj.subTypes.TAP[7] = {};
      singleObj.subTypes.TAP[7].metric = 'BlueAbsCoef';
      singleObj.subTypes.TAP[7].val = parsedLines[k][8];
      singleObj.subTypes.TAP[7].unit = '';
      singleObj.subTypes.TAP[8] = {};
      singleObj.subTypes.TAP[8].metric = 'SampleFlow';
      singleObj.subTypes.TAP[8].val = parsedLines[k][9];
      singleObj.subTypes.TAP[8].unit = '';
      singleObj.subTypes.TAP[9] = {};
      singleObj.subTypes.TAP[9].metric = 'HeaterSetPoint';
      singleObj.subTypes.TAP[9].val = parsedLines[k][10];
      singleObj.subTypes.TAP[9].unit = '';
      singleObj.subTypes.TAP[10] = {};
      singleObj.subTypes.TAP[10].metric = 'SampleAirTemp';
      singleObj.subTypes.TAP[10].val = parsedLines[k][11];
      singleObj.subTypes.TAP[10].unit = '';
      singleObj.subTypes.TAP[11] = {};
      singleObj.subTypes.TAP[11].metric = 'CaseTemp';
      singleObj.subTypes.TAP[11].val = parsedLines[k][12];
      singleObj.subTypes.TAP[11].unit = '';
      singleObj.subTypes.TAP[12] = {};
      singleObj.subTypes.TAP[12].metric = 'RedRatio';
      singleObj.subTypes.TAP[12].val = parsedLines[k][13];
      singleObj.subTypes.TAP[12].unit = '';
      singleObj.subTypes.TAP[13] = {};
      singleObj.subTypes.TAP[13].metric = 'GreenRatio';
      singleObj.subTypes.TAP[13].val = parsedLines[k][14];
      singleObj.subTypes.TAP[13].unit = '';
      singleObj.subTypes.TAP[14] = {};
      singleObj.subTypes.TAP[14].metric = 'BlueRatio';
      singleObj.subTypes.TAP[14].val = parsedLines[k][15];
      singleObj.subTypes.TAP[14].unit = '';
      singleObj.subTypes.TAP[15] = {};
      singleObj.subTypes.TAP[15].metric = 'Dark';
      singleObj.subTypes.TAP[15].val = parsedLines[k][16];
      singleObj.subTypes.TAP[15].unit = '';
      singleObj.subTypes.TAP[16] = {};
      singleObj.subTypes.TAP[16].metric = 'Red';
      singleObj.subTypes.TAP[16].val = parsedLines[k][17];
      singleObj.subTypes.TAP[16].unit = '';
      singleObj.subTypes.TAP[17] = {};
      singleObj.subTypes.TAP[17].metric = 'Green';
      singleObj.subTypes.TAP[17].val = parsedLines[k][18];
      singleObj.subTypes.TAP[17].unit = '';
      singleObj.subTypes.TAP[18] = {};
      singleObj.subTypes.TAP[18].metric = 'Blue';
      singleObj.subTypes.TAP[18].val = parsedLines[k][19];
      singleObj.subTypes.TAP[18].unit = '';
      singleObj.subTypes.TAP[19] = {};
      singleObj.subTypes.TAP[19].metric = 'DarkRef';
      singleObj.subTypes.TAP[19].val = parsedLines[k][20];
      singleObj.subTypes.TAP[19].unit = '';
      singleObj.subTypes.TAP[20] = {};
      singleObj.subTypes.TAP[20].metric = 'RedRef';
      singleObj.subTypes.TAP[20].val = parsedLines[k][21];
      singleObj.subTypes.TAP[20].unit = '';
      singleObj.subTypes.TAP[21] = {};
      singleObj.subTypes.TAP[21].metric = 'GreenRef';
      singleObj.subTypes.TAP[21].val = parsedLines[k][22];
      singleObj.subTypes.TAP[21].unit = '';
      singleObj.subTypes.TAP[22] = {};
      singleObj.subTypes.TAP[22].metric = 'BlueRef';
      singleObj.subTypes.TAP[22].val = parsedLines[k][23];
      singleObj.subTypes.TAP[22].unit = '';

      // add 6 hours to timestamp and then parse as UTC before converting to epoch
      const timeStamp = moment.utc(`${parsedLines[k][0]}_${parsedLines[k][1]}`, 'YYMMDD_HH:mm:ss').add(6, 'hour');
      let epoch = timeStamp.unix();
      epoch -= (epoch % 1); // rounding down
      singleObj.epoch = epoch;
      singleObj.epoch5min = epoch - (epoch % 300);
      singleObj.TimeStamp = `${parsedLines[k][0]}_${parsedLines[k][1]}`;
      singleObj.site = site.AQSID;
      singleObj.file = pathArray[pathArray.length - 1];
      singleObj._id = `${site.AQSID}_${epoch}_tap`;
      allObjects.push(singleObj);
    }

    // gathering time stamps and then call to bulkUpdate
    const startTimeStamp = moment.utc(`${parsedLines[0][0]}_${parsedLines[0][1]}`, 'YYMMDD_HH:mm:ss').add(6, 'hour');
    let startEpoch = startTimeStamp.unix();
    startEpoch -= (startEpoch % 1); // rounding down
    const endTimeStamp = moment.utc(`${parsedLines[parsedLines.length - 1][0]}_${parsedLines[parsedLines.length - 1][1]}`, 'YYMMDD_HH:mm:ss').add(6, 'hour');
    let endEpoch = endTimeStamp.unix();
    endEpoch -= (endEpoch % 1); // rounding down
    callToBulkUpdate(allObjects, path, site, startEpoch, endEpoch);
  }
});

const readFile = Meteor.bindEnvironment((path) => {
  // find out whether we have to read DAQFactory or Loggernet data
  const pathArray = path.split(pathModule.sep);
  const fileName = pathArray[pathArray.length - 1];
  const fileType = fileName.split(/[_]+/)[2];
  fs.readFile(path, 'utf-8', (err, output) => {
    let secondIteration = false;
    // HNET special treatment of data files from loggernet (met data)
    if (fileType.endsWith('met')) {
      Papa.parse(output, {
        header: false,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete(results) {
          if (!secondIteration) {
            // remove the first 4 lines - headers
            results.data.splice(0, 4);
            batchMetDataUpsert(results.data, path);
            secondIteration = true;
          } else {
            return;
          }
        }
      });
    } else if (fileType.endsWith('tap')) {
      Papa.parse(output, {
        header: false,
        delimiter: '\t',
        dynamicTyping: true,
        skipEmptyLines: true,
        complete(results) {
          if (!secondIteration) {
            // remove the first lines - headers (this is without the empty lines)
            results.data.splice(0, 28);
            batchTapDataUpsert(results.data, path);
            secondIteration = true;
          } else {
            return;
          }
        }
      });
    } else {
      Papa.parse(output, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete(results) {
          if (!secondIteration) {
            batchLiveDataUpsert(results.data, path);
            secondIteration = true;
          } else {
            return;
          }
        }
      });
    }
  });
});

export { exportDataAsCSV, perform5minAggregat, makeObj, createTCEQPushData, readFile };
