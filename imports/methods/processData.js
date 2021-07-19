import fs from 'fs-extra';
import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/votercircle:winston';
import { moment } from 'meteor/momentjs:moment';

import { readFile } from './commonFunctions';
import { ImportOldJob } from '../api/collections_server';

// create new job to import old data
export const reimportLiveData = function reimportLiveData(aqsid, selectedImportStartEpoch, selectedImportEndEpoch) {
  // id that will be created
  const submitEpoch = moment().unix();
  const id = `${aqsid}_${submitEpoch}`; 

  const newJob = {};
  newJob._id = id;
  newJob.site = aqsid;
  newJob.user = Meteor.user().emails[0].address; // user doing the edit
  newJob.startEpoch = selectedImportStartEpoch;
  newJob.endEpoch = selectedImportEndEpoch;
  newJob.submitEpoch = submitEpoch;
  newJob.jobStatus = 'pending';
  newJob.overwriteLiveData = false;
  newJob.overwriteAggrData = true;

  ImportOldJob.insert(newJob);
  return `${id}`;
};
