// required packages
const fs = Npm.require('fs');
import FTPS from 'ftps';

// reading ftps password from environment
const hnetsftp = process.env.hnetsftp;

/*
 * Export csv data file in defined format, default: TCEQ format
 */
function exportDataAsCSV(aqsid, startEpoch, endEpoch, format) {
  const dataObject = {};

  let aggregatData;

  if (endEpoch === undefined) {
    aggregatData = AggrData.find({
      $and: [{
        epoch: {
          $in: startEpoch,
        },
      }, {
        site: `${aqsid}`,
      }],
    }, {
      sort: {
        epoch: 1,
      },
    }).fetch();
  } else {
    aggregatData = AggrData.find({
      $and: [{
        epoch: {
          $gt: parseInt(startEpoch, 10),
          $lt: parseInt(endEpoch, 10),
        },
      }, {
        site: `${aqsid}`,
      }],
    }, {
      sort: {
        epoch: 1,
      },
    }).fetch();
  }

  dataObject.data = [];

  switch (format) {
    case 'raw':
      logger.info('raw export format not yet implemented.');
      break;
    default:
      _.each(aggregatData, function(e) {
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

        for (const subType in e.subTypes) {
          if (e.subTypes.hasOwnProperty(subType)) {
            if (subType !== '42i') {
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
                    let outputValue = data[1].val; // avg
                    // Unit conversion for Temp from C to F
                    if (instrument === 'Temp') {
                      outputValue = outputValue * 9 / 5 + 32;
                    } else if (instrument === 'WS') {
                      outputValue = Math.round(outputValue * 3600 / 1610.3 * 1000) / 1000;
                    }
                    obj[label] = outputValue.toFixed(3);
                  }
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
  return dataObject;
}

function pushTCEQData(aqsid, startEpoch, endEpoch, data) {
  const site = Sites.find({
    AQSID: `${aqsid}`,
  }).fetch()[0];

  if (site !== undefined) {
    // create site name from incoming folder
    const siteName = (site.incoming.match(new RegExp('UH' + '(.*)' + '_')))[1].slice(-2);
    // create csv file to be pushed in temp folder
    const outputFile = `/hnet/outgoing/temp/${siteName.toLowerCase()}${moment.utc().format('YYMMDDHHmmss')}.uh`;
    const csv = Papa.unparse(data);

    fs.writeFile(outputFile, csv, function(err) {
      if (err) {
        throw err;
      }
    });

    if (typeof(hnetsftp) === 'undefined') {
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

      // the following function creates its own scoped context
      ftps.cd('UH/tmp').addFile("/hnet/outgoing/temp/bh160622070330.uh").exec(null, Meteor.bindEnvironment(function(res) {
				logger.info(res);
        // insert a timestamp for the pushed data

        Exports.insert({
          _id: `${aqsid}_${moment().unix()}`,
          timeStamp: moment().unix(),
          site: aqsid,
          startEpoch: startEpoch,
          endEpoch: endEpoch,
					file: outputFile,
        });

      }, function(err) {
        return logger.error('Error during push file:', (err || res.error));
      }));
    }
  } else {
    logger.error('Could not find dir for AQSID: ', aqsid, ' in Sites.');
  }
};

Meteor.methods({
  exportData(aqsid, startEpoch, endEpoch, push) {
    const data = exportDataAsCSV(aqsid, startEpoch, endEpoch);
    if (data !== undefined && push) {
      pushTCEQData(aqsid, startEpoch, endEpoch, data);
    }
    return data;
  },
  insertUpdateFlag(siteId, epoch, instrument, measurement, flag, note) {
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
