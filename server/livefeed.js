// required packages
const fs = Npm.require('fs');
const pathModule = Npm.require('path');

function perform5minAggregat(siteId, startEpoch, endEpoch) {
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
    },
    //        {
    //            $limit: 5 //testing only!
    //        },
    {
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
    }
  ];

  LiveData.aggregate(pipeline, Meteor.bindEnvironment(function(err, result) {
    _.each(result, function(e) {
      const subObj = {};
      subObj._id = `${e.site}_${e._id}`;
      subObj.site = e.site;
      subObj.epoch = e._id;
      const subTypes = e.subTypes;
      const aggrSubTypes = {}; // hold aggregated data

      for (let i = 0; i < subTypes.length; i++) {
        for (var subType in subTypes[i]) {
          if (subTypes[i].hasOwnProperty(subType)) {
            var data = subTypes[i][subType];
            var numValid = 1;
            var newkey;

            // if flag is not existing, put 1 as default, need to ask Jim?
            if (data[0].val === '') {
              data[0].val = 1;
            }
            if (data[0].val !== 1) { // if flag is not 1 (valid) don't increase numValid
              numValid = 0;
            }

            if (subType.indexOf('RMY') >= 0) { // special calculation for wind data
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
              var windNord = Math.cos(windDir / 180 * Math.PI) * windSpd;
              var windEast = Math.sin(windDir / 180 * Math.PI) * windSpd;

              let flag = data[0].val;

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

                if (!aggrSubTypes[newkey]) {
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
      var newaggr = {};
      for (var aggr in aggrSubTypes) {
        if (aggrSubTypes.hasOwnProperty(aggr)) {
          var split = aggr.lastIndexOf('_');
          var instrument = aggr.substr(0, split);
          var measurement = aggr.substr(split + 1);
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
          for (var instrument in newaggr) {
            for (var measurement in newaggr[instrument]) {
              const $set = {};
              $set['subTypes.' + instrument + '.' + measurement + '.0'] = newaggr[instrument][measurement][0];
              $set['subTypes.' + instrument + '.' + measurement + '.1'] = newaggr[instrument][measurement][1];
              $set['subTypes.' + instrument + '.' + measurement + '.2'] = newaggr[instrument][measurement][2];
              $set['subTypes.' + instrument + '.' + measurement + '.3'] = newaggr[instrument][measurement][3];
              $set['subTypes.' + instrument + '.' + measurement + '.4'] = newaggr[instrument][measurement][4];
              AggrData.update({
                _id: subObj._id
              }, {
                $set: $set
              }, { upsert: true });
            }
          }
        }
      });
    });
  }, function (error) {
    throw new Meteor.Error(`error during aggregation: ${JSON.stringify(error)}`);
  }));
}

var makeObj = function(keys, startIndex, previousObject) {
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
        } else {
          if (measurement === 'Flag') { // Flag should be always first
            obj.subTypes[metron].unshift({ metric: measurement, val: value });
          } else {
            obj.subTypes[metron].push({ metric: measurement, val: value, unit: unitType });
          }
        }
      }
    }
  }

  for (var subType in obj.subTypes) {
    if (obj.subTypes.hasOwnProperty(subType)) {
      // automatic flagging of 03 values to be flagged with 9(N)
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
    }
  }

  return obj;
};

var batchLiveDataUpsert = Meteor.bindEnvironment(function(parsedLines, path) {
  // find the site information using the location of the file that is being read
  const pathArray = path.split(pathModule.sep);
  const parentDir = pathArray[pathArray.length - 2];
  const site = LiveSites.findOne({incoming: parentDir});

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
      }, {validate: false});
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
      epoch = epoch - (epoch % 1); // rounding down
      singleObj.epoch = epoch;
      singleObj.epoch5min = epoch - (epoch % 300);
      singleObj.theTime = parsedLines[k].TheTime;
      singleObj.site = site.AQSID;
      singleObj.file = pathArray[pathArray.length - 1];
      singleObj._id = `${site.AQSID}_${epoch}`;
      allObjects.push(singleObj);
      previousObject = singleObj;
    }

    // using bulkCollectionUpdate
    bulkCollectionUpdate(LiveData, allObjects, {
      callback: function() {
        const nowEpoch = moment().unix();
        const agoEpoch = moment.unix(fileModified).subtract(24, 'hours').unix();

        logger.info(`LiveData updated for: ${site.siteName}, now calling aggr for epochs: ${agoEpoch} - ${nowEpoch} ${moment.unix(agoEpoch).format('YYYY/MM/DD HH:mm:ss')} - ${moment.unix(nowEpoch).format('YYYY/MM/DD HH:mm:ss')}`);
        perform5minAggregat(site.AQSID, agoEpoch, nowEpoch);
      }
    });
  }
});

var batchMetDataUpsert = Meteor.bindEnvironment(function(parsedLines, path) {
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
      singleObj.subTypes.TRH[2].val = parsedLines[k][3];
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

      let epoch = moment(parsedLines[k][0], 'YYYY-MM-DD HH:mm:ss').unix();
      epoch = epoch - (epoch % 1); // rounding down
      singleObj.epoch = epoch;
      singleObj.epoch5min = epoch - (epoch % 300);
      singleObj.TimeStamp = parsedLines[k][0];
      singleObj.site = site.AQSID;
      singleObj.file = pathArray[pathArray.length - 1];
      singleObj._id = `${site.AQSID}_${epoch}_met`;
      allObjects.push(singleObj);
    }

    // using bulkCollectionUpdate
    bulkCollectionUpdate(LiveData, allObjects, {
      callback: function() {
        const nowEpoch = moment().unix();
        const agoEpoch = moment.unix(fileModified).subtract(24, 'hours').unix();

        logger.info(`LiveData updated for: ${site.siteName}, now calling aggr for epochs: ${agoEpoch} - ${nowEpoch} ${moment.unix(agoEpoch).format('YYYY/MM/DD HH:mm:ss')} - ${moment.unix(nowEpoch).format('YYYY/MM/DD HH:mm:ss')}`);
        perform5minAggregat(site.AQSID, agoEpoch, nowEpoch);
      }
    });
  }
});

const readFile = Meteor.bindEnvironment(function(path) {
  // test whether the siteId in the file name matches the directory
  const pathArray = path.split(pathModule.sep);
  const fileName = pathArray[pathArray.length - 1];
  const siteId = fileName.split(/[_]+/)[1];
	const fileType = fileName.split(/[_]+/)[2];
  const parentDir = pathArray[pathArray.length - 2];
  const test = parentDir.substring(parentDir.lastIndexOf('UH') + 2, parentDir.lastIndexOf('_'));
  if (siteId === test) {
    fs.readFile(path, 'utf-8', (err, output) => {
      let secondIteration = false;
      // HNET special treatment of data files from Loggernet (met data)
      if (fileType.endsWith('met')) {
        Papa.parse(output, {
          header: false,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete(results) {
            // remove the first 4 lines - headers
            results.data.splice(0, 4);
            if (!secondIteration) {
              batchMetDataUpsert(results.data, path);
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
  } else {
    logger.error('File has been added in not matching directory.');
  }
});

Meteor.methods({
  new5minAggreg(siteId, startEpoch, endEpoch) {
    logger.info(`Helper called 5minAgg for site: ${siteId} start: ${startEpoch} end: ${endEpoch}`);
    perform5minAggregat(siteId, startEpoch, endEpoch);
  }
});

const liveWatcher = chokidar.watch('/hnet/incoming/current', {
  ignored: /[\/\\]\./,
  ignoreInitial: true,
  usePolling: true,
  persistent: true
});

liveWatcher.on('add', (path) => {
  logger.info('File ', path, ' has been added.');
  readFile(path);
}).on('change', (path) => {
  logger.info('File', path, 'has been changed');
  readFile(path);
}).on('addDir', (path) => {
  logger.info('Directory', path, 'has been added');
}).on('error', (error) => {
  logger.error('Error happened', error);
}).on('ready', () => {
  logger.info('Ready for changes in /hnet/incoming/current/.');
});
