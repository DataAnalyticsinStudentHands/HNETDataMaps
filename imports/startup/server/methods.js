import { Meteor } from 'meteor/meteor';
import { loadFile, exportData } from '../../methods/fileFunctions';
import { resetLastPushDate } from '../../methods/adminFunctions';
import { deleteAggregates, insertEditFlag, insertEdits, pushEdits } from '../../methods/editFunctions';
import { pushData } from '../../methods/pushFunctions';
import { create5minAggregates, reimportLiveData } from '../../methods/processData';

Meteor.methods({
  'create5minAggregates': create5minAggregates,
  'deleteAggregates': deleteAggregates,
  'exportData': exportData,
  'insertEditFlag': insertEditFlag,
  'insertEdits': insertEdits,
  'loadFile': loadFile,
  'pushData': pushData,
  'pushEdits': pushEdits,
  'reimportLiveData': reimportLiveData,
  'resetLastPushDate': resetLastPushDate
});
