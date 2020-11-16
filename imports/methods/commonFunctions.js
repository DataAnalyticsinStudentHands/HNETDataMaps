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
      $sort: {
        epoch: -1
      }
    }, {
      $out: aggrResultsName
    }
  ];

  Promise.await(LiveData.rawCollection().aggregate(pipeline, { allowDiskUse: true }).toArray());

  // tap switch variables ***MUST*** be viable over iterations of the foreach loop
  // 1 is online. Assume online unless specified otherwise in TAP switch implementation
  var TAP01Flag = 1, TAP02Flag = 1;
  var TAP01Epoch = 0, TAP02Epoch = 0;

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

          /** Tap flag implementation **/

          // Get flag from DAQ data and save it
          if (subType.indexOf('TAP01') >= 0) {
            TAP01Flag = data[0].val;
            TAP01Epoch = subObj.epoch;
          } else if (subType.indexOf('TAP02') >= 0) {
            TAP02Flag = data[0].val;
            TAP02Epoch = subObj.epoch;
          }

          // Get flag from TAP0(1|2)Flag and give it to the appropriate instrument
          if (subType.indexOf('tap_') >= 0) {
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
            if (parseInt(subTypeName) % 2 === 0) {
              // Even - Needs flag from TAP01
              // Make sure that tap data has a corresponding timestamp in DaqFactory file
              // If not, break and do not aggregate datapoint
              epochDiff = subObj.epoch - TAP01Epoch;
              if (epochDiff >= 0 && epochDiff < 10) {
                data[0].val = TAP01Flag;
              } else {
                break;
              }
            } else {
              // Odd - Needs flag from TAP02
              // Make sure that tap data has a corresponding timestamp in DaqFactory file
              // If not, break and do not aggregate datapoint
              epochDiff = subObj.epoch - TAP02Epoch;
              if (epochDiff >= 0 && epochDiff < 10) {
                data[0].val = TAP02Flag;
              } else {
                break;
              }
            }
          }

          /**  End of TAP switch implementation **/

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

    // Do not recalculate variable **MUST** be viable over the for loop below
    // Stores whether a tap instrument has been calculated
    // Using array due to unknown size of tap instruments being read
    let tapInstrumentCalculated = [];

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

        // Calculations for tap instruments done here
        if (tapInstrumentCalculated.find(finderValue => finderValue === instrument) === undefined && instrument.indexOf('tap_') > -1) {
          tapInstrumentCalculated.push(instrument);
          newaggr[instrument]['SAE'] = [];
          newaggr[instrument]['SSA_R'] = [];
          newaggr[instrument]['SSA_G'] = [];
          newaggr[instrument]['SSA_B'] = [];
          newaggr[instrument]['AAE'] = [];

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


          // SAE calculations begin here 
          // Need to make sure that Neph has valid data before calculations can begin
          if (aggrSubTypes['Neph_RedScattering'].Flag === 1 && aggrSubTypes['Neph_GreenScattering'].Flag === 1 && aggrSubTypes['Neph_BlueScattering'].Flag === 1) {
            let x = [635, 525, 450]; // Matlab code: x=[635,525,450]; %Wavelength values for Nephelometer 
            let y_Neph = [aggrSubTypes['Neph_RedScattering'].avg, aggrSubTypes['Neph_GreenScattering'].avg, aggrSubTypes['Neph_BlueScattering'].avg]; // Matlab code: y_Neph = outdata_Neph(:,2:4); %Scattering coefficient values from Daqfactory for Neph

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


            // SAE ranges: -1 - 4
            newaggr[instrument]['SAE'].push({ metric: 'calc', val: SAE_Neph });
            newaggr[instrument]['SAE'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SAE'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['SAE'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['SAE'].push({ metric: 'filler2', val: "undefined"});
          } else {
            newaggr[instrument]['SAE'].push({ metric: 'calc', val: 'NaN' });
            newaggr[instrument]['SAE'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SAE'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['SAE'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['SAE'].push({ metric: 'filler2', val: "undefined"});
          }



          //SSA calculations begin here:
          if (aggrSubTypes['Neph_RedScattering'].Flag === 1) {
            let TotalExtinction_R = aggrSubTypes['Neph_RedScattering'].avg + aggrSubTypes[instrument + '_' + 'RedAbsCoef'].avg; // Matlab code: TotalExtinction_R = AC_R_Combined + outdata_Neph(:,2); %Total Extinction calculation for Red wavelength
            let SSA_R = aggrSubTypes['Neph_RedScattering'].avg / TotalExtinction_R; // Matlab code: SSA_R = outdata_Neph(:,2)./TotalExtinction_R; % SSA calculation for Red Wavelength
            SSA_R = (SSA_R < 0 || SSA_R == 1) ? 'NaN' : SSA_R; // Matlab code: SSA_R (SSA_R < 0 | SSA_R ==1)=NaN; 
            newaggr[instrument]['SSA_R'].push({ metric: 'calc', val: SSA_R });
            newaggr[instrument]['SSA_R'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SSA_R'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['SSA_R'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['SSA_R'].push({ metric: 'filler2', val: "undefined"});
          } else {
            newaggr[instrument]['SSA_G'].push({ metric: 'calc', val: 'NaN' });
            newaggr[instrument]['SSA_G'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SSA_G'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['SSA_G'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['SSA_G'].push({ metric: 'filler2', val: "undefined"});
          }

          if (aggrSubTypes['Neph_GreenScattering'].Flag === 1) {
            let TotalExtinction_G = aggrSubTypes['Neph_GreenScattering'].avg + aggrSubTypes[instrument + '_' + 'GreenAbsCoef'].avg; // Matlab code: TotalExtinction_G = AC_G_Combined + outdata_Neph(:,3); %Total Extinction calculation for Green wavelength
            let SSA_G = aggrSubTypes['Neph_GreenScattering'].avg / TotalExtinction_G; // Matlab code: SSA_G = outdata_Neph(:,3)./TotalExtinction_G; % SSA calculation for Green Wavelength
            SSA_G = (SSA_G < 0 || SSA_G == 1) ? 'NaN' : SSA_G; // Matlab code: SSA_G (SSA_G < 0 | SSA_G ==1)=NaN; 
            newaggr[instrument]['SSA_G'].push({ metric: 'calc', val: SSA_G });
            newaggr[instrument]['SSA_G'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SSA_G'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['SSA_G'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['SSA_G'].push({ metric: 'filler2', val: "undefined"});
          } else {
            newaggr[instrument]['SSA_G'].push({ metric: 'calc', val: 'NaN' });
            newaggr[instrument]['SSA_G'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SSA_G'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['SSA_G'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['SSA_G'].push({ metric: 'filler2', val: "undefined"});
          }

          if (aggrSubTypes['Neph_BlueScattering'].Flag === 1) {
            let TotalExtinction_B = aggrSubTypes['Neph_BlueScattering'].avg + aggrSubTypes[instrument + '_' + 'BlueAbsCoef'].avg; // Matlab code: TotalExtinction_B = AC_B_Combined + outdata_Neph(:,4); %Total Extinction calculation for Blue wavelength
            let SSA_B = aggrSubTypes['Neph_BlueScattering'].avg / TotalExtinction_B; // Matlab code: SSA_B = outdata_Neph(:,4)./TotalExtinction_B; % SSA calculation for Blue Wavelength
            SSA_B = (SSA_B < 0 || SSA_B == 1) ? 'NaN' : SSA_B; // Matlab code: SSA_B (SSA_B < 0 | SSA_B ==1)=NaN; 
            newaggr[instrument]['SSA_B'].push({ metric: 'calc', val: SSA_B });
            newaggr[instrument]['SSA_B'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SSA_B'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['SSA_B'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['SSA_B'].push({ metric: 'filler2', val: "undefined"});
          } else {
            newaggr[instrument]['SSA_B'].push({ metric: 'calc', val: 'NaN' });
            newaggr[instrument]['SSA_B'].push({ metric: 'unit', val: "undefined" });
            newaggr[instrument]['SSA_B'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['SSA_B'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['SSA_B'].push({ metric: 'filler2', val: "undefined"});
          }


          // AAE calculations begin here:
          // Make sure tap instrument is valid
          if (obj.Flag === 1) {
            let x = [640, 520, 365]; // Matlab code: x=[640,520,365]; % Wavelengths values
            let y_TAP = [ // Matlab code: y_TAP_01 = outdata1_TAP_01(:,6:8); %Absorption coefficients from TAP01
              isNaN(aggrSubTypes[instrument + '_' + 'RedAbsCoef'].avg) ? 0 : aggrSubTypes[instrument + '_' + 'RedAbsCoef'].avg, 
              isNaN(aggrSubTypes[instrument + '_' + 'GreenAbsCoef'].avg) ? 0 : aggrSubTypes[instrument + '_' + 'GreenAbsCoef'].avg, 
              isNaN(aggrSubTypes[instrument + '_' + 'BlueAbsCoef'].avg) ? 0 : aggrSubTypes[instrument + '_' + 'BlueAbsCoef'].avg
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

            // AAE ranges: .5 - 3.5
            newaggr[instrument]['AAE'].push({ metric: 'calc', val: AAE_TAP });
            newaggr[instrument]['AAE'].push({ metric: 'unit', val: "undefined"});
            newaggr[instrument]['AAE'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['AAE'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['AAE'].push({ metric: 'filler2', val: "undefined"});
          } else {
            newaggr[instrument]['AAE'].push({ metric: 'calc', val: 'NaN' });
            newaggr[instrument]['AAE'].push({ metric: 'unit', val: "undefined"});
            newaggr[instrument]['AAE'].push({ metric: 'Flag', val: obj.Flag});
            newaggr[instrument]['AAE'].push({ metric: 'filler1', val: "undefined" });
            newaggr[instrument]['AAE'].push({ metric: 'filler2', val: "undefined"});
          }
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
      startAggrEpoch = moment.unix(fileModified).subtract(1, 'hours').unix();
    } else {
      startAggrEpoch = moment.unix(fileModified).subtract(24, 'hours').unix();
    }
    endAggrEpoch = moment().unix();
  }
  bulkCollectionUpdate(LiveData, allObjects, {
    callback() {
      logger.info(`LiveData updated from: ${path} for: ${site.siteName} - ${site.AQSID}`);
      // call aggregation function only if we got new data from DAQFactory
      if (daqFactory && globalsite !== undefined) {
        logger.info(`Now calling 5minAgg for epochs: ${startAggrEpoch} - ${endAggrEpoch} ${moment.unix(startAggrEpoch).format('YYYY/MM/DD HH:mm:ss')} - ${moment.unix(endAggrEpoch).format('YYYY/MM/DD HH:mm:ss')}`);
        perform5minAggregat(site.AQSID, startAggrEpoch, endAggrEpoch);
      }
    }
  });
});

const batchLiveDataUpsert = Meteor.bindEnvironment((parsedLines, path) => {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({ incoming: parentDir });

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
    callToBulkUpdate(allObjects, path, site, startEpoch, endEpoch, true);
  }
});

const batchMetDataUpsert = Meteor.bindEnvironment((parsedLines, path) => {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({ incoming: parentDir });

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
    callToBulkUpdate(allObjects, path, site, startEpoch, endEpoch, false);
  }
});

const batchTapDataUpsert = Meteor.bindEnvironment((parsedLines, path) => {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({ incoming: parentDir });

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
      const timeStamp = moment.utc(`${parsedLines[k][0]}_${parsedLines[k][1]}`, 'YYMMDD_HH:mm:ss').add(6, 'hour');
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
    const startTimeStamp = moment.utc(`${parsedLines[0][0]}_${parsedLines[0][1]}`, 'YYMMDD_HH:mm:ss').add(6, 'hour');
    let startEpoch = startTimeStamp.unix();
    startEpoch -= (startEpoch % 1); // rounding down
    const endTimeStamp = moment.utc(`${parsedLines[parsedLines.length - 1][0]}_${parsedLines[parsedLines.length - 1][1]}`, 'YYMMDD_HH:mm:ss').add(6, 'hour');
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
