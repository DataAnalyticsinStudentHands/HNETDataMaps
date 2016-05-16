// required packages
const fs = Npm.require('fs');
import FTPS from 'ftps';

// reading ftps password from environment
const hnetsftp = process.env.hnetsftp;

/*
 * Export csv data file in defined format, default: TCEQ format
 */
var exportDataAsCSV = Meteor.bindEnvironment(function (aqsid, startEpoch, endEpoch, format) {
  const dir = Sites.find({
    AQSID: aqsid,
  }).fetch()[0];

  if (dir !== undefined) {

    const dataObject = {};
    // create site name from incoming folder
    const siteName = dir.incoming.match(new RegExp('UH' + '(.*)' + '_'));
    const outputFile = `/hnet/outgoing/current/${dir.incoming}/${siteName[1].toLowerCase()}${moment.unix(startEpoch).format('YYMMDDHHmmss')}.uh`;

    const aggregatData = AggrData.find({
      $and: [{
        epoch: {
          $gt: parseInt(startEpoch, 10),
          $lt: parseInt(endEpoch, 10),
        },
      }, {
        site: aqsid,
      }],
    }, {
      sort: {
        epoch: 1,
      },
    }).fetch();

    dataObject.data = [];

    switch (format) {
      case 'raw':
        logger.info('raw export format not yet implemented.');
        break;
      default:
        _.each(aggregatData, function (e) {
          const obj = {};
          obj.siteID = e.site.substring(e.site.length - 3, e.site.length);
          obj.dateGMT = moment.utc(moment.unix(e.epoch)).format('YY/MM/DD');
          obj.timeGMT = moment.utc(moment.unix(e.epoch)).format('HH:mm:ss');
          obj.status = 1;

          for (const subType in e.subTypes) {
            if (e.subTypes.hasOwnProperty(subType)) {
              const instruments = e.subTypes[subType];
              for (const instrument in instruments) {
                if (instruments.hasOwnProperty(instrument)) {
                  let label = `${subType}_${instrument}_channel`;
                  obj[label] = channelHash[subType + '_' + instrument]; // channel
                  const data = instruments[instrument];
                  label = `${subType}_${instrument}_flag`;
                  obj[label] = flagsHash[_.last(data).val].label; // Flag
                  label = `${subType}_${instrument}_value`;
                  // taking care of flag Q (span)
                  if (flagsHash[_.last(data).val].label === 'Q') {
                    obj[label] = 0; // set value to 0
                  } else {
                    obj[label] = data[1].val.toFixed(3); // avg
                  }
                }
              }
            }
          }

          obj.QCref_channel = 50;
          obj.QCref_flag = 'K';
          obj.QCref_value = 0;
          obj.QCstatus_channel = 51;
          obj.QCstatus_flag = 'K';
          obj.QCstatus_value = 99000;
          dataObject.data.push(obj);
        });
    }

    const csv = Papa.unparse(dataObject.data);
 	logger.info(`${csv}`);
    fs.writeFile(outputFile, csv, function (err) {
      if (err) {
        throw err;
      }
    });

    dataObject.file = outputFile;

    return dataObject;
  } else {
    logger.error('Could not find dir for AQSID: ', aqsid, ' in Sites.');
  }
});

function pushTCEQData(file) {
  logger.info(`Helper called for testPush: ${file}`);
  if (typeof (hnetsftp) === 'undefined') {
    // hnetsftp environment variable doesn't exists
    logger.error('No password found for hnet sftp.');
  } else {
    const ftps = new FTPS({
      host: 'ftps.tceq.texas.gov',
      username: 'jhflynn@central.uh.edu',
      password: hnetsftp,
      protocol: 'ftps',
      // protocol is added on beginning of host, ex : sftp://domain.com in this case
      port: 990, // optional
      // port is added to the end of the host, ex: sftp://domain.com:22 in this case
    });

    ftps.cd('UH/tmp').addFile(file).exec(function (err, res) {
      if (err || res.error) {
        return logger.error('Error during push file:', (err || res.error));
      }
      logger.info(res);
    });
  }
}

Meteor.methods({
  exportData: function (site, startEpoch, endEpoch) {
    logger.info('Helper called export/push for site: ', site, ' and start: ', startEpoch, ' and end: ', endEpoch);
    const data = exportDataAsCSV(site, startEpoch, endEpoch);
    if (data !== undefined) {
      pushTCEQData(data.file);
    }
    return data;
  },
  insertUpdateFlag: function (siteId, epoch, instrument, measurement, flag, note) {
    // id that will receive the update
    const id = `${siteId}_${epoch / 1000}`; // seconds
    // new field
    const insertField = 'subTypes.' + instrument + '.' + measurement.split(/[ ]+/)[0];
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
      _id: id,
    }, qry);
  },
});
