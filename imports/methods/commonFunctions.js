// These are functions that are the same for the front-end and backend. If changes are being made, they should be pulled over.
import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import { logger } from 'meteor/votercircle:winston';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import fs from 'fs-extra';
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

export { exportDataAsCSV, perform5minAggregat, makeObj, createTCEQPushData };
