import FTPS from 'ftps';
import pathModule from 'path';
import Future from 'fibers/future';
import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/votercircle:winston';
import { _ } from 'meteor/underscore';
import { exportDataAsCSV, createTCEQPushData } from './commonFunctions';
import { AggrData, LiveSites } from '../api/collections_server';
import { AggrEdits } from '../api/collections_client';
import { hnetsftp } from '../startup/server/startup';

export const deleteAggregates = function deleteAggregates(aqsid, startEpoch, endEpoch) {
  return AggrData.remove({
    site: `${aqsid}`,
    $and: [
      {
        epoch: {
          $gte: parseInt(startEpoch, 10)
        }
      }, {
        $and: [
          {
            epoch: {
              $lte: parseInt(endEpoch, 10)
            }
          }
        ]
      }
    ]
  });
};

export const pushEdits = function pushEdits(aqsid, pushPointsEpochs) {
  const activeSites = LiveSites.find({AQSID: `${aqsid}`});

  activeSites.forEach((site) => {
    if (site.TCEQPushing === 'Inactive') {
      throw new Meteor.Error('TCEQPushing is Inactive');
    }
  })

  if (typeof (hnetsftp) === 'undefined') {
    // hnetsftp environment variable doesn't exists
    throw new Meteor.Error('No password found for hnet sftp.');
  }

  const startEpoch = pushPointsEpochs[0];
  const endEpoch = _.last(pushPointsEpochs);

  let data;
  let pushFile;

  try {
    data = exportDataAsCSV(aqsid, pushPointsEpochs, null, 'tceq');
    if (data === undefined) {
      throw new Meteor.Error('pushEdits', 'Could not find data for selected site/period.');
    }
    pushFile = createTCEQPushData(aqsid, data);

    const ftps = new FTPS({ host: 'ftps.tceq.texas.gov', username: 'jhflynn@central.uh.edu', password: hnetsftp, protocol: 'ftps', port: 990 });
    // Set up a future
    const fut = new Future();
    // call ftps async method
    ftps.cd('UH/c696').addFile(pushFile).exec((err, res) => {
      if (res.error) {
        fut.throw(res.error);
      } else {
        logger.info(`Pushed via edits as file ${pushFile} ${JSON.stringify(res)}`);
        // Return the results
        fut.return(`${pushFile}`);
      }
    });

    const result = fut.wait();
    // update edit data points with push date
    const points = AggrEdits.find({
      startEpoch: {
        $gte: startEpoch
      },
      $and: [
        {
          endEpoch: {
            $lte: endEpoch
          }
        }
      ]
    });

    points.forEach((point) => {
      AggrEdits.update({
        _id: point._id
      }, {
        $set: {
          fileName: pushFile
        }
      });
    });
    return pathModule.basename(result);
  } catch (err) {
    logger.error(err);
    throw new Meteor.Error('Error during push edits file', err);
  }
};

export const insertEditFlag = function insertEditFlag(siteId, epoch, instrument, measurement, flag, note) {
  // id that will receive the update
  const id = `${siteId}_${epoch / 1000}`; // seconds

  // new field
  const insertField = `subTypes.${instrument}.${measurement.split(/[ ]+/)[0]}`;
  // update value
  const qry = {};
  qry.$push = {};
  qry.$push[insertField] = {};
  qry.$push[insertField].val = flag;
  qry.$push[insertField].metric = 'Overwrite Flag';
  qry.$push[insertField].user = Meteor.user().emails[0].address; // user doing the edit
  qry.$push[insertField].note = note;
  qry.$push[insertField].epoch = moment().unix();

  AggrData.update({
    _id: id
  }, qry);
};

export const insertEdits = function insertEdits(editedPoints, flag, note) {
  // id that will be created
  const firstPoint = editedPoints[0];
  const editEpoch = moment().unix();
  const id = `${firstPoint.site}_${editEpoch}`; // seconds

  const newEdit = {};
  newEdit._id = id;
  newEdit.editEpoch = editEpoch;
  newEdit.startEpoch = firstPoint.x / 1000;
  newEdit.endEpoch = editedPoints[editedPoints.length - 1].x / 1000;
  newEdit.site = firstPoint.site;
  newEdit.instrument = firstPoint.instrument;
  newEdit.flag = flag;
  newEdit.user = Meteor.user().emails[0].address; // user doing the edit
  newEdit.note = note;
  newEdit.pushed = '';
  newEdit.editedPoints = editedPoints;

  AggrEdits.insert(newEdit);
};
