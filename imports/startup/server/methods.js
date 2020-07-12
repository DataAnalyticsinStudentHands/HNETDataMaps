import { Meteor } from 'meteor/meteor';
import { loadFile, exportData } from '../../methods/fileFunctions';
import { resetLastPushDate } from '../../methods/adminFunctions';
import { deleteAggregates, insertEditFlag, insertEdits, pushEdits } from '../../methods/editFunctions';
import { pushData } from '../../methods/pushFunctions';
import { reimportLiveData } from '../../methods/processData';
import { perform5minAggregat } from '../../methods/commonFunctions';

Meteor.methods({
  'create5minAggregates': perform5minAggregat,
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
