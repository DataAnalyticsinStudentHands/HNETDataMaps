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
import { AggrData, LiveData, LiveSites } from '../api/collections_server';
import { channelHash, flagsHash } from '../api/constants';
import { globalsite } from '../startup/server/startup';
import * as mathjs from 'mathjs';

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
      if (aggregatData.length !== 0) {
        dataObject.data = [];
        dataObject.fields = ['siteID', 'dateGMT', 'timeGMT']; // create fields for unparse
      }
      _.each(aggregatData, (e) => {
        const obj = {};
        const siteID = e.site.substring(e.site.length - 4, e.site.length);
        if (siteID.startsWith('0')) {
          obj.siteID = e.site.substring(e.site.length - 3, e.site.length);
        } else if (siteID.startsWith('9')) {
          obj.siteID = e.site;
        } else {
          obj.siteID = e.site.substring(e.site.length - 4, e.site.length);
        }
        obj.dateGMT = moment.utc(moment.unix(e.epoch)).format('YY/MM/DD');
        obj.timeGMT = moment.utc(moment.unix(e.epoch)).format('HH:mm:ss');

        Object.keys(e.subTypes).forEach((instrument) => {
          if (Object.prototype.hasOwnProperty.call(e.subTypes, instrument)) {
            const measurements = e.subTypes[instrument];
            Object.keys(measurements).forEach((measurement) => {
              if (Object.prototype.hasOwnProperty.call(measurements, measurement)) {
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
                  if (outputValue !== 'undefined')
                    obj[label] = outputValue.toFixed(3);
                }
              }
            });
          }
        });
        dataObject.data.push(obj);
      });
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

// performs the creation of 5 minute aggregate data points for BC2 sites
function perform5minAggregatBC2(siteId, startEpoch, endEpoch) {
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
      $sort: {
        epoch: 1
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

  /*
   * Only aggregate data if a certain percentage (defined by thresholdPercent) of the required data is in the 5minepoch.
   * There is supposed to be 630 database documents per 5minepoch.
   *
   * 30 documents for DAQFactory, 300 documents for TAP01, and 300 documents for TAP02.
   * Eventually we'll just pull how many datapoints are expected from the database. This will work for now
   *
   * Take for example if thresholdPercent were .75.
   *
   * There would need to be:
   * 30 * .75 = 22.5 
   * round(22.5) = 23 documents for DAQFactory required
   *
   * 300 * .75 = 225
   * 225 documents for TAP01 and TAP02 are required
   *
   * ONE EXCEPTION:
   * aggregate regardless of missing data if it is 55 min from the startEpoch
   *
   * Also, left these outside the loop because unnecessary calculations slow the loop down. 
   * Additionally, we will be querying for this data rather than relying on hardcoded numbers later on.
   * Querying a database is slow. The less of those we do, the better.
   */

  const thresholdPercent = .75;
  // Hard coded numbers. Should not be hardcoded but oh well. Should be changed in the future.
  const maxDAQFactoryCount = 30, maxTAPCount = 300;
  const minDAQFactoryCount = Math.round(thresholdPercent * maxDAQFactoryCount);
  const minTAPcount = Math.round(thresholdPercent * maxTAPCount);

  // tap switch variables ***MUST*** be viable over iterations of the foreach loop
  // 8 is offline. Assume offline unless specified otherwise in TAP switch implementation
  var TAP01Flag = 8, TAP02Flag = 8;
  var TAP01Epoch = 0, TAP02Epoch = 0;

  // For some god aweful reason, some sites don't have neph flags. Need to check for neph flag before assigning whatever
  let hasNephFlag = false;

  // Tap data filtration is required. These variables are simply placeholders for where the rgb abs coef indeces and sampleFlow index is at.
  // ***MUST*** be viable over for loop
  let hasCheckedTAPdataSchema = false;
  let tapDataSchemaIndex = {};
  tapDataSchemaIndex.RedAbsCoef = undefined, tapDataSchemaIndex.GreenAbsCoef = undefined, tapDataSchemaIndex.BlueAbsCoef = undefined, tapDataSchemaIndex.SampleFlow = undefined;
  let TAP01Name = undefined;
  let TAP02Name = undefined;
  const allElementsEqual = arr => arr.every(v => v === arr[0]);

  AggrResults.find({}).forEach((e) => {
    const subObj = {};
    subObj._id = `${e.site}_${e._id}`;
    subObj.site = e.site;
    subObj.epoch = e._id;
    const subTypes = e.subTypes;
    const aggrSubTypes = {}; // hold aggregated data
    let newData = (endEpoch - 3300 - subObj.epoch) < 0;

    let subTypesLength = subTypes.length
    for (let i = 0; i < subTypesLength; i++) {
      for (const subType in subTypes[i]) {
        if (subTypes[i].hasOwnProperty(subType)) {
          const data = subTypes[i][subType];
          let numValid = 1;
          var newkey;

          // if Neph flag is undefined, flag it 1, otherwise ignore
          if (subType.includes("Neph")) {
            if (data[0].metric === 'Flag') {
              hasNephFlag = true;
            }
            if (!hasNephFlag) {
              data.unshift({ metric: 'Flag', val: 1, unit: 'NA' });
            }
          }


          /** Tap flag implementation **/
          // Get flag from DAQ data and save it
          if (subType.includes('TAP01')) {
            TAP01Flag = data[0].val === 10 ? 1 : data[0].val;
            TAP01Epoch = subObj.epoch;
          } else if (subType.includes('TAP02')) {
            TAP02Flag = data[0].val === 10 ? 8 : data[0].val
            TAP02Epoch = subObj.epoch;
          }

          // Get flag from TAP0(1|2)Flag and give it to the appropriate instrument
          if (subType.includes('tap_')) {

            // TAP01 = even
            // TAP02 = odd
            // confusing amirite!?
            // EXAMPLE:
            // tap_SN36 <- even goes to TAP01
            // tap_SN37 <- odd goes to TAP02
            // This is parsing tap_* string for integer id
            var subTypeName = subType;
            let epochDiff;
            do {
              subTypeName = subTypeName.slice(1);
            } while (isNaN(subTypeName));
            let subTypeNum = subTypeName;
            if (parseInt(subTypeNum) % 2 === 0) {
              // Even - Needs flag from TAP01
              // Make sure that tap data has a corresponding timestamp in DaqFactory file
              // If not, break and do not aggregate datapoint
              epochDiff = subObj.epoch - TAP01Epoch;

              if (epochDiff >= 0 && epochDiff < 10) {
                data[0].val = TAP01Flag;
              } else {
                data[0].val = 20;
              }
            } else {
              // Odd - Needs flag from TAP02
              // Make sure that tap data has a corresponding timestamp in DaqFactory file
              // If not, break and do not aggregate datapoint
              epochDiff = subObj.epoch - TAP02Epoch;
              if (epochDiff >= 0 && epochDiff < 10) {
                data[0].val = TAP02Flag;
              } else {
                data[0].val = 20;
              }
            }

            /** Data filtration start **/

            /* Reason for data filtration to be inside this subType.includes is for performance reasons. The less if statements ran, the faster.
            */

            /* Matlab code
             * Some data filtration is required. We will not aggregate datapoints (not records) that do not fit our standards.
             * To Note: Comments in matlab are my own comments

              % Do not aggregate data point if r, g, b is < 0 or > 100 
              r1=numa(:,7);
              g1=numa(:,8);
              b1=numa(:,9);
              r2(r2 < 0 | r2 > 100) = NaN;
              g2(g2 < 0 | g2 > 100) = NaN;
              b2(b2 < 0 | b2 > 100) = NaN;


              %TAP_02data defined here
              TAP_02data = [JD2 time2 A_spot2 R_spot2 flow2 r2 g2 b2 Tr2 Tg2 Tb2];

              % Don't aggregate data point if SampleFlow / Flow(L/min) is off 5% from 1.7 Min: 1.615, Max: 1.785
              idx = find(TAP_02data (:,5) <1.63 | TAP_02data (:,5) >1.05*1.7); %condition if flow is 5% off 1.7lpm
              TAP_02data(idx,5:8) = NaN; clear idx time2 A_spot2 R_spot2 flow2 r2 g2 b2 Tr2 Tg2 Tb2


              % This is for the TAP switching. It was a way to get the TAP switching working in the matlab script.
              % Don't aggregate the first 100s after a switch has occured. Let instrument recalibrate. 
              R01 = strfind(isnan(TAP_02data(:,5)).', [1 0]); % Find Indices Of [0 1] Transitions
              for i=1:100
              TAP_02data(R01+i,6:8) = NaN; % Replace Appropriate Values With 'NaN '
              end


              20 = potentially invalid data
              1 = valid data
              */

            // Reason for if statement is to speed the code up alot. 
            // Having to check for the schema every run is VERY significant.
            // Only having to do it once and assuming the rest will be the same is a very safe assumption.
            // If this isn't true, then lord help us all
            if (!hasCheckedTAPdataSchema) {
              let dataLength = data.length;
              for (let k = 0; k < dataLength; k++) {
                if (data[k].metric === 'RedAbsCoef') {
                  tapDataSchemaIndex.RedAbsCoef = k;
                }
                if (data[k].metric === 'GreenAbsCoef') {
                  tapDataSchemaIndex.GreenAbsCoef = k;
                }
                if (data[k].metric === 'BlueAbsCoef') {
                  tapDataSchemaIndex.BlueAbsCoef = k;
                }
                if (data[k].metric === 'SampleFlow') {
                  tapDataSchemaIndex.SampleFlow = k;
                }
              }
              hasCheckedTAPdataSchema = true;
            }

            // We flag the faulty data with flag 20.
            if (data[tapDataSchemaIndex.RedAbsCoef].val < 0 || data[tapDataSchemaIndex.RedAbsCoef].val > 100 || isNaN(data[tapDataSchemaIndex.RedAbsCoef].val)) {
              data[tapDataSchemaIndex.RedAbsCoef].Flag = 20;
            }

            if (data[tapDataSchemaIndex.GreenAbsCoef].val < 0 || data[tapDataSchemaIndex.GreenAbsCoef].val > 100 || isNaN(data[tapDataSchemaIndex.GreenAbsCoef].val)) {
              data[tapDataSchemaIndex.GreenAbsCoef].Flag = 20;
            }

            if (data[tapDataSchemaIndex.BlueAbsCoef].val < 0 || data[tapDataSchemaIndex.BlueAbsCoef].val > 100 || isNaN(data[tapDataSchemaIndex.BlueAbsCoef].val)) {
              data[tapDataSchemaIndex.BlueAbsCoef].Flag = 20;
            }

            if (data[tapDataSchemaIndex.SampleFlow].val < 1.615 || data[tapDataSchemaIndex.SampleFlow].val > 1.785 || isNaN(data[tapDataSchemaIndex.SampleFlow].val)) {
              data[tapDataSchemaIndex.SampleFlow].Flag = 20;
            }


            /** Data filtration finished **/ 
          }

          /**  End of TAP switch implementation **/

          // Don't aggregate TAP01 and TAP02 subtype. They are only useful for giving TAP_SNXX flags
          if (subTypes.includes("TAP01") || subTypes.includes("TAP02")) {
            continue;
          }


          // if flag is not existing, put 9 as default, need to ask Jim?
          if (data[0].val === '') {
            data[0].val = 9;
          }
          if (data[0].val !== 1) { // if flag is not 1 (valid) don't increase numValid
            numValid = 0;
          }
          for (let j = 1; j < data.length; j++) {
            newkey = subType + '_' + data[j].metric;

            // TAP data requires data filtration. Setting flag to 20 if such for specified values. 
            // Otherwise, use suggested flag value from file
            const flag = data[j].Flag !== undefined ? data[j].Flag : data[0].val;

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

    // This is prep for calculations. Need ensure that we are working with data that has the data necessary to do calculations.
    // The for loop for transforming aggregated data to a generic data format is more useful for calculations than raw aggrSubTypes.
    // All I'm doing here is collecting a little bit of information of what we are working with before I do calculations.
    let hasTap = false;
    let hasNeph = false;
    // Don't have to do this with neph. Neph will always have the same name. Tap will always have different numbers
    let tapNames = [];

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

        // Some specific setting up for tap calculations and skipping
        if (instrument.includes("Neph")) {
          hasNeph = true;

          // If obj.totalCounter (which is documentation for the amount of datapoints in our 5minepoch) is < minTAPcount
          // And what we are aggregating is greater than 55 minutes from endEpoch: 
          // SKIP 
          if (obj.totalCounter < minDAQFactoryCount && newData) {
            // This forces the forEach loop to go to the next loop skipping pushing data into database
            return;
          }
        }

        if (instrument.includes("tap_")) {
          hasTap = true;
          if (!tapNames.includes(instrument)) {
            tapNames.push(instrument);
          }

          if (obj.totalCounter < 300)
            // If obj.totalCounter (which is documentation for the amount of datapoints in our 5minepoch) is < minTAPcount
            // And what we are aggregating is greater than 55 minutes from endEpoch: 
            // SKIP 
            if (obj.totalCounter < minTAPcount && newData) {
              // This forces the forEach loop to go to the next loop skipping pushing data into database
              return;
            }
        }

        if (!newaggr[instrument][measurement]) { newaggr[instrument][measurement] = [];
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

    // If TAP or NEPH is missing AND what we are aggregating is greater than 55 minutes from endEpoch:
    // SKIP
    if ((tapNames.length < 2 || !hasNeph) && newData) {
      // This forces the forEach loop to go to the next loop skipping pushing data into database
      return;      
    }

    /** Helpful functions for calculations **/

    // flips sign for all elements in array
    function flipSignForAll1D(arr) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] *= -1;
      }
    }

    // flips sign for all elements in 2D array
    function flipSignForAll2D(M) {
      for (let i = 0; i < M.length; i++) {
        flipSignForAll1D(M[i]);
      }
    }

    // returns row reduced echelon form of given matrix
    // if vector, return rref vector
    // if invalid, do nothing
    function rref(M) {
      let rows = M.length;
      let columns = M[0].length;
      if (((rows === 1 || rows === undefined) && columns > 0) || ((columns === 1 || columns === undefined) && rows > 0)) {
        M = [];
        let vectorSize = Math.max(isNaN(columns) ? 0 : columns, isNaN(rows) ? 0 : rows);
        for (let i = 0; i < vectorSize; i++) {
          M.push(0);
        }
        M[0] = 1;
        return M;
      } else if (rows < 0 || columns < 0) {
        return;
      }

      let lead = 0;
      for (let k = 0; k < rows; k++) {
        if (columns <= lead) {
          return;
        }

        let i = k;
        while (M[i][lead] === 0) {
          i++;
          if (rows === i) {
            i = k;
            lead++;
            if (columns === lead) {                
              return;
            }
          }
        }
        let p = M[i]
        let s = M[k];
        M[i] = s, M[k] = p;

        let scalar = M[k][lead];
        for (let j = 0; j < columns; j++) {
          M[k][j] /= scalar;
        }

        for (let i = 0; i < rows; i++) {
          if (i === k) continue;
          scalar = M[i][lead];
          for (let j = 0; j < columns; j++) {
            M[i][j] -= scalar * M[k][j];
          }
        }
        lead++;
      }
      return M;
    }
    /** END of Helpful functions for calculations **/

    // Calculations for Nepholometer is done here
    if (hasNeph) {
      newaggr['Neph']['SAE'] = [];

      if (newaggr['Neph']['RedScattering'] === undefined || newaggr['Neph']['GreenScattering'] === undefined || newaggr['Neph']['BlueScattering'] === undefined) {
        newaggr['Neph']['SAE'].push({ metric: 'calc', val: 'NaN' });
        newaggr['Neph']['SAE'].push({ metric: 'unit', val: "undefined" });
        newaggr['Neph']['SAE'].push({ metric: 'Flag', val: 20});
      } else {

        let RedScatteringFlagIndex = 0;
        let RedScatteringAvgIndex = 0;
        for (let index = 0; index < newaggr['Neph']['RedScattering'].length; index++) {
          if (newaggr['Neph']['RedScattering'][index].metric === 'Flag') {
            RedScatteringFlagIndex = index;
          }
          if (newaggr['Neph']['RedScattering'][index].metric === 'avg') {
            RedScatteringAvgIndex = index;
          }
        }

        let GreenScatteringFlagIndex = 0;
        let GreenScatteringAvgIndex = 0;
        for (let index = 0; index < newaggr['Neph']['GreenScattering'].length; index++) {
          if (newaggr['Neph']['GreenScattering'][index].metric === 'Flag') {
            GreenScatteringFlagIndex = index;
          }
          if (newaggr['Neph']['GreenScattering'][index].metric === 'avg') {
            GreenScatteringAvgIndex = index;
          }
        }

        let BlueScatteringFlagIndex = 0;
        let BlueScatteringAvgIndex = 0;
        for (let index = 0; index < newaggr['Neph']['BlueScattering'].length; index++) {
          if (newaggr['Neph']['BlueScattering'][index].metric === 'Flag') {
            BlueScatteringFlagIndex = index;
          }
          if (newaggr['Neph']['BlueScattering'][index].metric === 'avg') {
            BlueScatteringAvgIndex = index;
          }
        }


        // SAE calculations begin here 
        // Need to make sure that Neph has valid data before calculations can begin
        if (newaggr['Neph']['RedScattering'][RedScatteringFlagIndex].val === 1 && newaggr['Neph']['GreenScattering'][GreenScatteringFlagIndex].val === 1 && newaggr['Neph']['BlueScattering'][BlueScatteringFlagIndex].val === 1) {
          let x = [635, 525, 450]; // Matlab code: x=[635,525,450]; %Wavelength values for Nephelometer 
          let y_Neph = [
            newaggr['Neph']['RedScattering'][RedScatteringAvgIndex].val,
            newaggr['Neph']['GreenScattering'][GreenScatteringAvgIndex].val,
            newaggr['Neph']['BlueScattering'][BlueScatteringAvgIndex].val
          ]; // Matlab code: y_Neph = outdata_Neph(:,2:4); %Scattering coefficient values from Daqfactory for Neph

          let lx = mathjs.log(x); // Matlab code: lx = log(x); %Taking log of wavelength
          let ly_Neph = mathjs.log(y_Neph); // Matlab code: ly_Neph = log(y_Neph); %Taking log of scattering coefficient values

          // Matlab code: log_Neph = -[lx(:) ones(size(x(:)))] \ ly_Neph(:,:)'; %Step 1- SAE calulation
          // going to have to break this down a little bit
          let log_Neph = [ // [lx(:) ones(size(x(:)))]
            lx, 
            mathjs.ones(mathjs.size(x))
          ];
          log_Neph = mathjs.transpose(log_Neph); // Needed to make matrix 3 x 2

          // - operator just negates everything in the matrix
          flipSignForAll2D(log_Neph);
          /*
           * if A is a rectangular m-by-n matrix with m ~= n, and B is a matrix with m rows, then A\B returns a least-squares solution to the system of equations A*x= B.
           * Least squares solution approximation is needed.
           * Links to calculating least squares solution:
           * https://textbooks.math.gatech.edu/ila/least-squares.html
           * https://www.youtube.com/watch?v=9UE8-6Jlezw
           */

          // A^T*A
          let ATA = mathjs.multiply(mathjs.transpose(log_Neph), log_Neph);
          // A^T*b
          let ATb = mathjs.multiply(mathjs.transpose(log_Neph), ly_Neph);

          // Create augmented matrix to solve for least squares solution
          ATA[0].push(ATb[0]);
          ATA[1].push(ATb[1]);

          log_Neph = rref(ATA);
          // Reason for index 0,2 is because I am skipping a step in the least squares approximation.
          // It is supposed to return a vector with 2 values, but I just shortcut it straight to the correct answer from the 3x2 rref matrix
          let SAE_Neph = log_Neph[0][2]; // SAE_Neph = log_Neph(1,:)'; %Step 2- SAE calulation

          // SAE ranges should be: -1 - 5
          // Matlab code: SAE_Neph(SAE_Neph > 5)= NaN;
          // Sujan said this ^^^
          // Unsure If I want to check for zero value
          if (SAE_Neph === undefined || SAE_Neph < -1 || SAE_Neph > 5) { 
            newaggr['Neph']['SAE'].push({ metric: 'calc', val: ((SAE_Neph === undefined) ? 'NaN' : SAE_Neph) });
            newaggr['Neph']['SAE'].push({ metric: 'unit', val: "undefined" });
            newaggr['Neph']['SAE'].push({ metric: 'Flag', val: 20 });
          } else {
            newaggr['Neph']['SAE'].push({ metric: 'calc', val:  SAE_Neph });
            newaggr['Neph']['SAE'].push({ metric: 'unit', val: "undefined" });
            // Must be valid data if it it came this far
            newaggr['Neph']['SAE'].push({ metric: 'Flag', val: 1 });
          }
        } else {
          newaggr['Neph']['SAE'].push({ metric: 'calc', val: 'NaN' });
          newaggr['Neph']['SAE'].push({ metric: 'unit', val: "undefined" });
          // It's just easier to assign flag 20 when if fails
          newaggr['Neph']['SAE'].push({ metric: 'Flag', val: 20 });
        }
      }
    }

    // Unfortunately, Neph doesn't really have a flag. It's just trusted that if there is data, it is valid. 
    // I'll ensure data exists before a calculation for safety reasons.
    // Calculations for tap instruments done here
    tapNames.forEach((instrument) =>  {
      newaggr[instrument]['SSA_Red'] = [];
      newaggr[instrument]['SSA_Green'] = [];
      newaggr[instrument]['SSA_Blue'] = [];
      newaggr[instrument]['AAE'] = [];
      if (newaggr['Neph'] !== undefined && newaggr['Neph']['RedScattering'] !== undefined && newaggr['Neph']['GreenScattering'] !== undefined && newaggr['Neph']['BlueScattering'] !== undefined) {
        let RedScatteringFlagIndex = 0;
        let RedScatteringAvgIndex = 0;
        for (let index = 0; index < newaggr['Neph']['RedScattering'].length; index++) {
          if (newaggr['Neph']['RedScattering'][index].metric === 'Flag') {
            RedScatteringFlagIndex = index;
          }
          if (newaggr['Neph']['RedScattering'][index].metric === 'avg') {
            RedScatteringAvgIndex = index;
          }
        }

        let GreenScatteringFlagIndex = 0;
        let GreenScatteringAvgIndex = 0;
        for (let index = 0; index < newaggr['Neph']['GreenScattering'].length; index++) {
          if (newaggr['Neph']['GreenScattering'][index].metric === 'Flag') {
            GreenScatteringFlagIndex = index;
          }
          if (newaggr['Neph']['GreenScattering'][index].metric === 'avg') {
            GreenScatteringAvgIndex = index;
          }
        }

        let BlueScatteringFlagIndex = 0;
        let BlueScatteringAvgIndex = 0;
        for (let index = 0; index < newaggr['Neph']['BlueScattering'].length; index++) {
          if (newaggr['Neph']['BlueScattering'][index].metric === 'Flag') {
            BlueScatteringFlagIndex = index;
          }
          if (newaggr['Neph']['BlueScattering'][index].metric === 'avg') {
            BlueScatteringAvgIndex = index;
          }
        }

        let RedAbsCoefFlagIndex = 0;
        let RedAbsCoefAvgIndex = 0;
        for (let index = 0; index < newaggr[instrument]['RedAbsCoef'].length; index++) {
          if (newaggr[instrument]['RedAbsCoef'][index].metric === 'Flag') {
            RedAbsCoefFlagIndex = index;
          }
          if (newaggr[instrument]['RedAbsCoef'][index].metric === 'avg') {
            RedAbsCoefAvgIndex = index;
          }
        }

        let GreenAbsCoefFlagIndex = 0;
        let GreenAbsCoefAvgIndex = 0;
        for (let index = 0; index < newaggr[instrument]['GreenAbsCoef'].length; index++) {
          if (newaggr[instrument]['GreenAbsCoef'][index].metric === 'Flag') {
            GreenAbsCoefFlagIndex = index;
          }
          if (newaggr[instrument]['GreenAbsCoef'][index].metric === 'avg') {
            GreenAbsCoefAvgIndex = index;
          }
        }

        let BlueAbsCoefFlagIndex = 0;
        let BlueAbsCoefAvgIndex = 0;
        for (let index = 0; index < newaggr[instrument]['BlueAbsCoef'].length; index++) {
          if (newaggr[instrument]['BlueAbsCoef'][index].metric === 'Flag') {
            BlueAbsCoefFlagIndex = index;
          }
          if (newaggr[instrument]['BlueAbsCoef'][index].metric === 'avg') {
            BlueAbsCoefAvgIndex = index;
          }
        }

        // If any of the SSA calculations fail, AAE calculations will fail.
        // Allows Different SSA colors to still do calculations whilst preventing AAE from failing
        let SSAFailed = false;

        //SSA calculations begin here:
        let obj = {
          Flag:newaggr[instrument]['RedAbsCoef'][RedAbsCoefFlagIndex].val,
          avg:newaggr[instrument]['RedAbsCoef'][RedAbsCoefAvgIndex].val
        };
        if (parseInt(newaggr['Neph']['RedScattering'][RedScatteringFlagIndex].val) === 1 && parseInt(obj.Flag) === 1) {
          let redScatteringAvg = parseFloat(newaggr['Neph']['RedScattering'][RedScatteringAvgIndex].val);
          let TotalExtinction_R = redScatteringAvg + obj.avg; // Matlab code: TotalExtinction_R = AC_R_Combined + outdata_Neph(:,2); %Total Extinction calculation for Red wavelength
          let SSA_R = redScatteringAvg / TotalExtinction_R; // Matlab code: SSA_R = outdata_Neph(:,2)./TotalExtinction_R; % SSA calculation for Red Wavelength

          newaggr[instrument]['SSA_Red'].push({ metric: 'calc', val: SSA_R });
          newaggr[instrument]['SSA_Red'].push({ metric: 'unit', val: "undefined" });
          newaggr[instrument]['SSA_Red'].push({ metric: 'Flag', val: obj.Flag});

          // Matlab code: SSA_R (SSA_R < 0 | SSA_R ==1)=NaN;
          // decided > 1 because I have no idea why he used == and not >
          // I decided to make it SSA_R <= 0 to because javascript sends error values to zero by default
          if (SSA_R === undefined || SSA_R <= 0 || SSA_R > 1) {
            newaggr[instrument]['SSA_Red'].push({ metric: 'calc', val: ((SSA_R === undefined) ? 'NaN' : SSA_R) });
            newaggr[instrument]['SSA_Red'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SSA_Red'].push({ metric: 'Flag', val: 20});
          }
        } else {
          newaggr[instrument]['SSA_Red'].push({ metric: 'calc', val: 'NaN' });
          newaggr[instrument]['SSA_Red'].push({ metric: 'unit', val: "undefined" });
          newaggr[instrument]['SSA_Red'].push({ metric: 'Flag', val: obj.Flag});
          SSAFailed = true;
        }

        obj = {
          Flag:newaggr[instrument]['GreenAbsCoef'][GreenAbsCoefFlagIndex].val,
          avg:newaggr[instrument]['GreenAbsCoef'][GreenAbsCoefAvgIndex].val 
        };
        if (parseInt(newaggr['Neph']['GreenScattering'][GreenScatteringFlagIndex].val) === 1 && parseInt(obj.Flag) === 1) {
          let greenScatteringAvg = parseFloat(newaggr['Neph']['GreenScattering'][GreenScatteringAvgIndex].val);
          let TotalExtinction_G = greenScatteringAvg + obj.avg; // Matlab code: TotalExtinction_G = AC_G_Combined + outdata_Neph(:,3); %Total Extinction calculation for Green wavelength
          let SSA_G = greenScatteringAvg / TotalExtinction_G; // Matlab code: SSA_G = outdata_Neph(:,3)./TotalExtinction_G; % SSA calculation for Green Wavelength
          newaggr[instrument]['SSA_Green'].push({ metric: 'calc', val: SSA_G });
          newaggr[instrument]['SSA_Green'].push({ metric: 'unit', val: "undefined" });
          newaggr[instrument]['SSA_Green'].push({ metric: 'Flag', val: obj.Flag});

          // Matlab code: SSA_G (SSA_G < 0 | SSA_G ==1)=NaN;
          // decided > 1 because I have no idea why he used == and not >
          // I decided to make it SSA_G <= 0 to because javascript sends error values to zero by default
          if (SSA_G === undefined || SSA_G <= 0 || SSA_G > 1) {
            newaggr[instrument]['SSA_Green'].push({ metric: 'calc', val: ((SSA_G === undefined) ? 'NaN' : SSA_G) });
            newaggr[instrument]['SSA_Green'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SSA_Green'].push({ metric: 'Flag', val: 20 });
          }
        } else {
          newaggr[instrument]['SSA_Green'].push({ metric: 'calc', val: 'NaN' });
          newaggr[instrument]['SSA_Green'].push({ metric: 'unit', val: "undefined" });
          newaggr[instrument]['SSA_Green'].push({ metric: 'Flag', val: obj.Flag});
          SSAFailed = true;
        }

        obj = {
          Flag:newaggr[instrument]['BlueAbsCoef'][BlueAbsCoefFlagIndex].val,
          avg:newaggr[instrument]['BlueAbsCoef'][BlueAbsCoefAvgIndex].val
        };
        if (parseInt(newaggr['Neph']['BlueScattering'][BlueScatteringFlagIndex].val) === 1 && parseInt(obj.Flag) === 1) {
          let blueScatteringAvg = parseFloat(newaggr['Neph']['BlueScattering'][BlueScatteringAvgIndex].val);
          let TotalExtinction_B = blueScatteringAvg + obj.avg; // Matlab code: TotalExtinction_B = AC_B_Combined + outdata_Neph(:,4); %Total Extinction calculation for Blue wavelength
          let SSA_B = blueScatteringAvg / TotalExtinction_B; // Matlab code: SSA_B = outdata_Neph(:,4)./TotalExtinction_B; % SSA calculation for Blue Wavelength

          newaggr[instrument]['SSA_Blue'].push({ metric: 'calc', val: SSA_B });
          newaggr[instrument]['SSA_Blue'].push({ metric: 'unit', val: "undefined" });
          newaggr[instrument]['SSA_Blue'].push({ metric: 'Flag', val: obj.Flag});

          // Matlab code: SSA_B (SSA_B < 0 | SSA_B ==1)=NaN; 
          // I decided to make it SSA_B <= 0 to because javascript sends error values to zero by default
          if (SSA_B === undefined || (SSA_B <= 0 || SSA_B == 1)) {
            newaggr[instrument]['SSA_Blue'].push({ metric: 'calc', val: ((SSA_B === undefined) ? 'NaN' : SSA_B) });
            newaggr[instrument]['SSA_Blue'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SSA_Blue'].push({ metric: 'Flag', val: 20});
          }
        } else {
          newaggr[instrument]['SSA_Blue'].push({ metric: 'calc', val: 'NaN' });
          newaggr[instrument]['SSA_Blue'].push({ metric: 'unit', val: "undefined" });
          newaggr[instrument]['SSA_Blue'].push({ metric: 'Flag', val: obj.Flag});
          SSAFailed = true;
        }
        if (!SSAFailed) {
          // AAE calculations begin here:
          // Make sure tap instrument is valid
          let x = [640, 520, 365]; // Matlab code: x=[640,520,365]; % Wavelengths values
          let y_TAP = [ // Matlab code: y_TAP_01 = outdata1_TAP_01(:,6:8); %Absorption coefficients from TAP01
            parseFloat(newaggr[instrument]['RedAbsCoef'][RedAbsCoefAvgIndex].val), 
            parseFloat(newaggr[instrument]['GreenAbsCoef'][GreenAbsCoefAvgIndex].val), 
            parseFloat(newaggr[instrument]['BlueAbsCoef'][BlueAbsCoefAvgIndex].val)
          ];

          let lx = mathjs.log(x); // Matlab code: lx = log(x); %Taking log of the wavelengths
          let ly_TAP = mathjs.log(y_TAP);// Matlab code: ly_TAP_01 = log(y_TAP_01); %Taking log of the absorption coefficients for TAP01
          for (let i = 0; i < ly_TAP.length; i++) {
            if (isNaN(ly_TAP[i]) || ly_TAP[i] < 0) {
              ly_TAP[i] = 0;
            }
          }

          // Going to have to break this matlab code down a bit, again:
          // Matlab code: log_TAP_01 = -[lx(:) ones(size(x(:)))] \ ly_TAP_01(:,:)'; %Step 1 -AAE from TAP 01 data
          let log_TAP = [ // Matlab code: [lx(:) ones(size(x(:)))] 
            lx,
            mathjs.ones(mathjs.size(x))
          ];
          log_TAP = mathjs.transpose(log_TAP); // Needs to be transposed into 3x2 matrix
          // - operator just negates everything in the matrix
          flipSignForAll2D(log_TAP);


          /* More information on how I came to the lines below is in the SAE calculations. 
           * Essentially, we are finding the least squares solution to the system of equations:
           * A*x=b
           */

          // A \ b
          let ATA = mathjs.multiply(mathjs.transpose(log_TAP), log_TAP);
          let ATb = mathjs.multiply(mathjs.transpose(log_TAP), ly_TAP);

          // Create augmented matrix to solve for least squares solution
          ATA[0].push(ATb[0]);
          ATA[1].push(ATb[1]);

          log_TAP = rref(ATA);
          // Reason for index 0,2 is because I am skipping a step in the least squares approximation.
          // It is supposed to return a vector with 2 values, but I just shortcut it straight to the correct answer from the 3x2 rref matrix
          let AAE_TAP = log_TAP[0][2]; // Matlab code: SAE_Neph = log_Neph(1,:)'; %Step 2- SAE calulation

          // AAE normal ranges: .5 - 3.5
          // Sujan said this ^^^
          // matlab comment: % AAE__TAP_A(AAE__TAP_A < 0)= NaN;
          // I decided to make it AAE_TAP <= 0 to because javascript sends error values to zero by default
          if (AAE_TAP === undefined || AAE_TAP <= 0 || AAE_TAP > 3.5) {
            newaggr[instrument]['AAE'].push({ metric: 'calc', val: ((AAE_TAP === undefined) ? 'NaN' : AAE_TAP) });
            newaggr[instrument]['AAE'].push({ metric: 'unit', val: "undefined"});
            newaggr[instrument]['AAE'].push({ metric: 'Flag', val: 20 });
          } else {
            newaggr[instrument]['AAE'].push({ metric: 'calc', val: AAE_TAP });
            newaggr[instrument]['AAE'].push({ metric: 'unit', val: "undefined"});
            newaggr[instrument]['AAE'].push({ metric: 'Flag', val: obj.Flag});
          }
        } else {
          newaggr[instrument]['AAE'].push({ metric: 'calc', val: 'NaN' });
          newaggr[instrument]['AAE'].push({ metric: 'unit', val: "undefined" });
          newaggr[instrument]['AAE'].push({ metric: 'Flag', val: 20 });
        }
      }
    });

    subObj.subTypes = newaggr;
    AggrData.insert(subObj, function(error, result) {
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
              // Some aggregations will have less than 5 parts to it. 
              // Need if statements to make sure it doesn't generate errors.
              // I really think that this whole thing should change, but I have no idea how it works.
              // So just leave this be and it will keep working.
              let newaggrLength = newaggr[newInstrument][newMeasurement].length;
              if (newaggrLength > 1) {
                const query0 = {};
                query0._id = subObj._id;
                query0[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'sum';
                const $set0 = {};
                $set0[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][0].val;
                AggrData.update(query0, { $set: $set0 });
              }
              if (newaggrLength > 1) {
                const query1 = {};
                query1._id = subObj._id;
                query1[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'avg';
                const $set1 = {};
                $set1[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][1].val;
                AggrData.update(query1, { $set: $set1 });
              }
              if (newaggrLength > 2) {
                const query2 = {};
                query2._id = subObj._id;
                query2[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'numValid';
                const $set2 = {};
                $set2[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][2].val;
                AggrData.update(query2, { $set: $set2 });
              }
              if (newaggrLength > 3) {
                const query3 = {};
                query3._id = subObj._id;
                query3[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'unit';
                const $set3 = {};
                $set3[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][3].val;
                AggrData.update(query3, { $set: $set3 });
              }
              if (newaggrLength > 4) {
                const query4 = {};
                query4._id = subObj._id;
                query4[`subTypes.${newInstrument}.${newMeasurement}.metric`] = 'Flag';
                const $set4 = {};
                $set4[`subTypes.${newInstrument}.${newMeasurement}.$.val`] = newaggr[newInstrument][newMeasurement][4].val;
                AggrData.update(query4, { $set: $set4 });
              }
            }
          });
        });
      }
    });
  });
  // drop temp collection that was placeholder for aggreagation results
  AggrResults.rawCollection().drop();
}

// performs the creation of 5 minute aggregate data points
function perform5minAggregat(siteId, startEpoch, endEpoch) {
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

  // get site name from incoming folder (TODO: take out check after we have renamed all folders)
  let siteName;
  try {
    siteName = (site.incoming.match(new RegExp('UH' +
      '(.*)' +
      '_')))[1].slice(-2);
  } catch (e) {
  }
  if (!(siteName === 'WL' || siteName === 'MT' || siteName === 'SP' || siteName === 'JF')) {
    siteName = site.incoming.split(/[_]+/)[1];
  }

  // Just ensures that a backslash is at the end of outgoingDir env variable
  let outgoingDir = process.env.outgoingDir;
  if (outgoingDir.charAt(outgoingDir.length-1) !== '/')
    outgoingDir = outgoingDir+'/';

  // ensure whether output dir exists
  const outputDir = `${outgoingDir}${moment().year()}/${moment().month() + 1}/${moment().date()}`;
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

// call bulkupdate for 10s data points
const callToBulkUpdate = Meteor.bindEnvironment((allObjects, path, site, startEpoch, endEpoch, daqFactory) => {
  let startAggrEpoch = startEpoch;
  let endAggrEpoch = endEpoch;

  // for backend create start/end epoch for call to data aggregation
  if (globalsite !== undefined) {
    // use modified timestamp of file to figure out how far back to go
    const stats = fs.statSync(path);
    const fileModified = moment(Date.parse(stats.mtime)).unix(); // from milliseconds into moments and then epochs

    // set start epoch for BC2 sites to be 1 hour in the past, for HNET sites 24 hours in the past
    if (site.siteGroup === 'BC2') {
      // Change the 1 to 1000000 to aggregate VERY old data serverside. Remember to change it back to 1 before you commit
      startAggrEpoch = moment.unix(fileModified).subtract(4, 'hours').unix();
    } else {
      startAggrEpoch = moment.unix(fileModified).subtract(24, 'hours').unix();
    }

		// Floor to the nearest 5 min epoch
		let currEpoch = moment().unix();
    endAggrEpoch = currEpoch - currEpoch % 300 - 300;
  }
  bulkCollectionUpdate(LiveData, allObjects, {
    callback() {
      logger.info(`LiveData updated from: ${path} for: ${site.siteName} - ${site.AQSID}`);
      // call aggregation function only if we got new data from DAQFactory
      if (daqFactory && globalsite !== undefined) {
        logger.info(`Now calling 5minAgg for epochs: ${startAggrEpoch} - ${endAggrEpoch} ${moment.unix(startAggrEpoch).format('YYYY/MM/DD HH:mm:ss')} - ${moment.unix(endAggrEpoch).format('YYYY/MM/DD HH:mm:ss')}`);

        // Perform BC2 aggregation for BC2 sites only
        if (site.siteGroup.includes("BC2")) {
          perform5minAggregatBC2(site.AQSID, startAggrEpoch, endAggrEpoch);
        } else {
          perform5minAggregat(site.AQSID, startAggrEpoch, endAggrEpoch);
        }
      }
    }
  });
});

const batchLiveDataUpsert = Meteor.bindEnvironment((parsedLines, path) => {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({ incoming: parentDir });
  // Get the timezone offset into one nice variable
  let siteTimeZone = site['GMToffset'] * -1 * 3600;


  if (site.AQSID) {
    // update the timestamp for the last update for the site
    if (globalsite !== undefined) {
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
    }

    // Only do this for BC2 sites teehee.
    // May have let this run for HNET sites too on accident.
		let siteData = Object.getOwnPropertyNames(parsedLines[0]);
		let TAP01CurrentFlagName = undefined;
		let TAP02CurrentFlagName = undefined;
		let siteInitial = undefined;
    if (site.siteGroup.includes("BC2")) {
      // Some BC2 sites do not label their TAP01 and TAP02 flags in their DAQfactory file with TAP01 and TAP02 labels in their csv file.
      // e.g. El Paso BC2 data uses TAP05 and TAP06. Annoying really.
      // All this does is check if we are working with BC2 data, and looks for what the flag name is currently set to.

      siteData.forEach((colName) => {
        if (colName.includes("BC2") && colName.includes("TAP") && colName.includes("Flag")) {
          let flagNum = colName.substring(colName.indexOf("Flag") - 3, colName.indexOf("Flag") - 1);
          siteInitial = colName.substring(colName.indexOf("BC2_") + 4, colName.indexOf("_", colName.indexOf("_") + 1));
          if (parseInt(flagNum) % 2 == 0) {
            TAP02CurrentFlagName = colName;
          } else {
            TAP01CurrentFlagName = colName;
          }
        }
      });
    }

    // create objects from parsed lines
    const allObjects = [];
    let previousObject = {};
    for (let k = 0; k < parsedLines.length; k++) {


      // Only do this for BC2 sites teehee.
      // May have let this run for HNET sites too on accident.
      if (site.siteGroup.includes("BC2")) {
      // The two if statements below take the above information on TAPFlag names and converts them accordingly.
      // Don't worry! If we aren't working with TAP data, it will just skip that right here. 

      // Redefines the TAP01Flag label here
        if (TAP01CurrentFlagName !== undefined) {
          let newFlagName = 'BC2_' + siteInitial + '_TAP01_Flag';
          parsedLines[k][newFlagName] = parsedLines[k][TAP01CurrentFlagName];
          if (newFlagName !== TAP01CurrentFlagName) {
            delete parsedLines[k][TAP01CurrentFlagName];
          }
        }

        // Redefines the TAP02Flag label here
        if (TAP02CurrentFlagName !== undefined) {
          let newFlagName = 'BC2_' + siteInitial + '_TAP02_Flag';
          parsedLines[k][newFlagName] = parsedLines[k][TAP02CurrentFlagName];
          if (newFlagName !== TAP02CurrentFlagName) {
            delete parsedLines[k][TAP02CurrentFlagName];
          }
        }
      }

      let singleObj = {};
      if (k === 0) {
        singleObj = makeObj(parsedLines[k], 1);
      } else {
        singleObj = makeObj(parsedLines[k], 1, previousObject);
      }

      // 86400 sec = 1 day
      // 3600 sec = 1 hour
      // 25569 sec = 7.1025 hours
      // let epoch = ((parsedLines[k].TheTime - 25569) * 86400) + (6 * 3600);
      let epoch = ((parsedLines[k].TheTime - 25569) * 86400) + siteTimeZone;
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
    // 86400 sec = 1 day
    // 3600 sec = 1 hour
    // 25569 sec = 7.1025 hours
    // original line: let startEpoch = ((parsedLines[0].TheTime - 25569) * 86400) + (6 * 3600);
    let startEpoch = ((parsedLines[0].TheTime - 25569) * 86400) + siteTimeZone;
    startEpoch -= (startEpoch % 1); // rounding down
    // original line: let endEpoch = ((parsedLines[parsedLines.length - 1].TheTime - 25569) * 86400) + (6 * 3600);
    let endEpoch = ((parsedLines[parsedLines.length - 1].TheTime - 25569) * 86400) + siteTimeZone;
    endEpoch -= (endEpoch % 1); // rounding down
    callToBulkUpdate(allObjects, path, site, startEpoch, endEpoch, true);
  }
});

const batchMetDataUpsert = Meteor.bindEnvironment((parsedLines, path) => {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({ incoming: parentDir });
  let siteTimeZone = site['GMToffset'] * -1;

  if (site.AQSID) {
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
      // original line: const timeStamp = moment.utc(parsedLines[k][0], 'YYYY-MM-DD HH:mm:ss').add(6, 'hour');
      const timeStamp = moment.utc(parsedLines[k][0], 'YYYY-MM-DD HH:mm:ss').add(siteTimeZone, 'hour');
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
    // original line: const startTimeStamp = moment.utc(parsedLines[0][0], 'YYYY-MM-DD HH:mm:ss').add(6, 'hour');
    const startTimeStamp = moment.utc(parsedLines[0][0], 'YYYY-MM-DD HH:mm:ss').add(siteTimeZone, 'hour');
    let startEpoch = startTimeStamp.unix();
    startEpoch -= (startEpoch % 1); // rounding down
    // original line: const endTimeStamp = moment.utc(parsedLines[parsedLines.length - 1][0], 'YYYY-MM-DD HH:mm:ss').add(6, 'hour');
    const endTimeStamp = moment.utc(parsedLines[parsedLines.length - 1][0], 'YYYY-MM-DD HH:mm:ss').add(siteTimeZone, 'hour');
    let endEpoch = endTimeStamp.unix();
    endEpoch -= (endEpoch % 1); // rounding down
    callToBulkUpdate(allObjects, path, site, startEpoch, endEpoch, false);
  }
});

const batchTapDataUpsert = Meteor.bindEnvironment((parsedLines, path) => {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({ incoming: parentDir });
  let siteTimeZone = site['GMToffset'] * -1;

  if (site.AQSID) {
    // use file name for TAP instrument identifier
    const metron = `tap_${path.split(/[_]+/)[3]}`;

    // create objects from parsed lines
    const allObjects = [];
    for (let k = 0; k < parsedLines.length; k++) {
      const singleObj = {};
      singleObj.subTypes = {};
      singleObj.subTypes[metron] = [];

      singleObj.subTypes[metron][0] = {};
      singleObj.subTypes[metron][0].metric = 'Flag';
      singleObj.subTypes[metron][0].val = 1;
      singleObj.subTypes[metron][1] = {};
      singleObj.subTypes[metron][1].metric = 'ActiveSpot';
      singleObj.subTypes[metron][1].val = parsedLines[k][2];
      singleObj.subTypes[metron][1].unit = '';
      singleObj.subTypes[metron][2] = {};
      singleObj.subTypes[metron][2].metric = 'RefSpot';
      singleObj.subTypes[metron][2].val = parsedLines[k][3];
      singleObj.subTypes[metron][2].unit = '';
      singleObj.subTypes[metron][3] = {};
      singleObj.subTypes[metron][3].metric = 'LPF';
      singleObj.subTypes[metron][3].val = parsedLines[k][4];
      singleObj.subTypes[metron][3].unit = '';
      singleObj.subTypes[metron][4] = {};
      singleObj.subTypes[metron][4].metric = 'AvgTime';
      singleObj.subTypes[metron][4].val = parsedLines[k][5];
      singleObj.subTypes[metron][4].unit = '';
      singleObj.subTypes[metron][5] = {};
      singleObj.subTypes[metron][5].metric = 'RedAbsCoef';
      singleObj.subTypes[metron][5].val = parsedLines[k][6];
      singleObj.subTypes[metron][5].unit = '';
      singleObj.subTypes[metron][6] = {};
      singleObj.subTypes[metron][6].metric = 'GreenAbsCoef';
      singleObj.subTypes[metron][6].val = parsedLines[k][7];
      singleObj.subTypes[metron][6].unit = '';
      singleObj.subTypes[metron][7] = {};
      singleObj.subTypes[metron][7].metric = 'BlueAbsCoef';
      singleObj.subTypes[metron][7].val = parsedLines[k][8];
      singleObj.subTypes[metron][7].unit = '';
      singleObj.subTypes[metron][8] = {};
      singleObj.subTypes[metron][8].metric = 'SampleFlow';
      singleObj.subTypes[metron][8].val = parsedLines[k][9];
      singleObj.subTypes[metron][8].unit = '';
      singleObj.subTypes[metron][9] = {};
      singleObj.subTypes[metron][9].metric = 'HeaterSetPoint';
      singleObj.subTypes[metron][9].val = parsedLines[k][10];
      singleObj.subTypes[metron][9].unit = '';
      singleObj.subTypes[metron][10] = {};
      singleObj.subTypes[metron][10].metric = 'SampleAirTemp';
      singleObj.subTypes[metron][10].val = parsedLines[k][11];
      singleObj.subTypes[metron][10].unit = '';
      singleObj.subTypes[metron][11] = {};
      singleObj.subTypes[metron][11].metric = 'CaseTemp';
      singleObj.subTypes[metron][11].val = parsedLines[k][12];
      singleObj.subTypes[metron][11].unit = '';
      singleObj.subTypes[metron][12] = {};
      singleObj.subTypes[metron][12].metric = 'RedRatio';
      singleObj.subTypes[metron][12].val = parsedLines[k][13];
      singleObj.subTypes[metron][12].unit = '';
      singleObj.subTypes[metron][13] = {};
      singleObj.subTypes[metron][13].metric = 'GreenRatio';
      singleObj.subTypes[metron][13].val = parsedLines[k][14];
      singleObj.subTypes[metron][13].unit = '';
      singleObj.subTypes[metron][14] = {};
      singleObj.subTypes[metron][14].metric = 'BlueRatio';
      singleObj.subTypes[metron][14].val = parsedLines[k][15];
      singleObj.subTypes[metron][14].unit = '';
      singleObj.subTypes[metron][15] = {};
      singleObj.subTypes[metron][15].metric = 'Dark';
      singleObj.subTypes[metron][15].val = parsedLines[k][16];
      singleObj.subTypes[metron][15].unit = '';
      singleObj.subTypes[metron][16] = {};
      singleObj.subTypes[metron][16].metric = 'Red';
      singleObj.subTypes[metron][16].val = parsedLines[k][17];
      singleObj.subTypes[metron][16].unit = '';
      singleObj.subTypes[metron][17] = {};
      singleObj.subTypes[metron][17].metric = 'Green';
      singleObj.subTypes[metron][17].val = parsedLines[k][18];
      singleObj.subTypes[metron][17].unit = '';
      singleObj.subTypes[metron][18] = {};
      singleObj.subTypes[metron][18].metric = 'Blue';
      singleObj.subTypes[metron][18].val = parsedLines[k][19];
      singleObj.subTypes[metron][18].unit = '';
      singleObj.subTypes[metron][19] = {};
      singleObj.subTypes[metron][19].metric = 'DarkRef';
      singleObj.subTypes[metron][19].val = parsedLines[k][20];
      singleObj.subTypes[metron][19].unit = '';
      singleObj.subTypes[metron][20] = {};
      singleObj.subTypes[metron][20].metric = 'RedRef';
      singleObj.subTypes[metron][20].val = parsedLines[k][21];
      singleObj.subTypes[metron][20].unit = '';
      singleObj.subTypes[metron][21] = {};
      singleObj.subTypes[metron][21].metric = 'GreenRef';
      singleObj.subTypes[metron][21].val = parsedLines[k][22];
      singleObj.subTypes[metron][21].unit = '';
      singleObj.subTypes[metron][22] = {};
      singleObj.subTypes[metron][22].metric = 'BlueRef';
      singleObj.subTypes[metron][22].val = parsedLines[k][23];
      singleObj.subTypes[metron][22].unit = '';

      // add 6 hours to timestamp and then parse as UTC before converting to epoch
      // original line: const timeStamp = moment.utc(`${parsedLines[k][0]}_${parsedLines[k][1]}`, 'YYMMDD_HH:mm:ss').add(6, 'hour');
      const timeStamp = moment.utc(`${parsedLines[k][0]}_${parsedLines[k][1]}`, 'YYMMDD_HH:mm:ss').add(siteTimeZone, 'hour');
      let epoch = timeStamp.unix();
      epoch -= (epoch % 1); // rounding down
      singleObj.epoch = epoch;
      singleObj.epoch5min = epoch - (epoch % 300);
      singleObj.TimeStamp = `${parsedLines[k][0]}_${parsedLines[k][1]}`;
      singleObj.site = site.AQSID;
      singleObj.file = pathArray[pathArray.length - 1];
      singleObj._id = `${site.AQSID}_${epoch}_${metron}`;
      allObjects.push(singleObj);
    }

    // gathering time stamps and then call to bulkUpdate
    // original line: const startTimeStamp = moment.utc(`${parsedLines[0][0]}_${parsedLines[0][1]}`, 'YYMMDD_HH:mm:ss').add(6, 'hour');
    const startTimeStamp = moment.utc(`${parsedLines[0][0]}_${parsedLines[0][1]}`, 'YYMMDD_HH:mm:ss').add(siteTimeZone, 'hour');
    let startEpoch = startTimeStamp.unix();
    startEpoch -= (startEpoch % 1); // rounding down
    // original line: const endTimeStamp = moment.utc(`${parsedLines[parsedLines.length - 1][0]}_${parsedLines[parsedLines.length - 1][1]}`, 'YYMMDD_HH:mm:ss').add(6, 'hour');
    const endTimeStamp = moment.utc(`${parsedLines[parsedLines.length - 1][0]}_${parsedLines[parsedLines.length - 1][1]}`, 'YYMMDD_HH:mm:ss').add(siteTimeZone, 'hour');
    let endEpoch = endTimeStamp.unix();
    endEpoch -= (endEpoch % 1); // rounding down
    callToBulkUpdate(allObjects, path, site, startEpoch, endEpoch, false);
  }
});

const readFile = Meteor.bindEnvironment((path) => {
  // find out which file type
  const pathArray = path.split(pathModule.sep);
  const fileName = pathArray[pathArray.length - 1];
  let fileType = fileName.split(/[_]+/)[2];
  if (fileName.startsWith('TAP')) {
    fileType = 'TAP';
  }

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
    } else if (fileType.startsWith('TAP')) {
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

