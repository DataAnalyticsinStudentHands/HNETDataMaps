import fs from 'fs-extra';
import Future from 'fibers/future';
import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/votercircle:winston';
import { exportDataAsCSV } from './commonFunctions';

export const loadFile = function loadFile(path) {
  const fut = new Future();

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
};

export const exportData = function exportData(aqsid, startEpoch, endEpoch, fileFormat) {
  const data = exportDataAsCSV(aqsid, startEpoch, endEpoch, fileFormat);

  if (Object.keys(data).length === 0 && data.constructor === Object) {
    throw new Meteor.Error('No data.', 'Could not find data for selected site/period.');
  }

  return data;
};
