import pathModule from 'path';
import fs from 'fs-extra';
import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/votercircle:winston';
import { moment } from 'meteor/momentjs:moment';
import { Papa } from 'meteor/harrison:papa-parse';
import { bulkCollectionUpdate } from 'meteor/udondan:bulk-collection-update';
import { LiveData, LiveSites } from '../api/collections_both';
import { perform5minAggregat, makeObj } from './commonFunctions';

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

    const startTimeStamp = moment.utc(parsedLines[0][0], 'YYYY-MM-DD HH:mm:ss').add(6, 'hour');
    let startEpoch = startTimeStamp.unix();
    startEpoch -= (startEpoch % 1); // rounding down
    const endTimeStamp = moment.utc(parsedLines[parsedLines.length - 1][0], 'YYYY-MM-DD HH:mm:ss').add(6, 'hour');
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

export const reimportLiveData = function reimportLiveData(incomingFolder, selectedDate, selectedType) {
  // get short site name from incoming folder
  const siteGroup = incomingFolder.split(/[_]+/)[0];
  const shortSiteName = incomingFolder.split(/[_]+/)[1];
  let path;

  switch (selectedType) {
    case 'LoggerNet(met)':
      if (siteGroup !== 'BC2') {
        path = `/hnet/incoming/current/${incomingFolder}/${siteGroup}_${shortSiteName}_TCEQmet_${moment(selectedDate, 'MM/DD/YYYY').format('YYMMDD')}.txt`;
      } else {
        path = `/hnet/incoming/current/${incomingFolder}/${siteGroup}_${shortSiteName}_met_${moment(selectedDate, 'MM/DD/YYYY').format('YYMMDD')}.txt`;
      }
      break;
    case 'TAP':
      path = `/hnet/incoming/current/${incomingFolder}/${siteGroup}_${shortSiteName}_tap_${moment(selectedDate, 'MM/DD/YYYY').format('YYMMDD')}.txt`;
      break;
    default: {
      if (siteGroup !== 'BC2') {
        path = `/hnet/incoming/current/${incomingFolder}/${siteGroup}_${shortSiteName}_TCEQ_${moment(selectedDate, 'MM/DD/YYYY').format('YYMMDD')}.txt`;
      } else {
        path = `/hnet/incoming/current/${incomingFolder}/${siteGroup}_${shortSiteName}_${moment(selectedDate, 'MM/DD/YYYY').format('YYMMDD')}.txt`;
      }
    }
  }

  if (!fs.existsSync(path)) {
    logger.error('Error in call for reimportLiveData.', `Could not find data file for ${selectedDate} and site ${shortSiteName}.`);
    throw new Meteor.Error('File does not exists.', `Could not find data file for ${selectedDate} and site ${shortSiteName}.`);
  }

  readFile(path);
  return `started reimport data at path ${path}`;
};
