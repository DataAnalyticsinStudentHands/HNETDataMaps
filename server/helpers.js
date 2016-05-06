// required packages
const fs = Npm.require('fs');

var exportDataAsCSV = Meteor.bindEnvironment(function (aqsid, startEpoch, endEpoch) {
  var dir = Sites.find({
    AQSID: aqsid,
  }).fetch()[0];

  if (dir !== undefined) {
    // output folder
    const siteName = dir.incoming.match(new RegExp('UH' + '(.*)' + '_')); // create site name from incoming folder
    const outputFile = `/hnet/outgoing/current/${dir.incoming}/${siteName[1].toLowerCase()}` + moment.unix(startEpoch).format('YYMMDDHHmmss') + '.uh';

    var aggregatData = AggrData.find({
      $and: [{
        epoch: {
          $gt: parseInt(startEpoch, 10),
          $lt: parseInt(endEpoch, 10),
        },
      }, {
        site: aqsid
      }]
    }, {
      sort: {
        epoch: 1
      }
    }).fetch();

    var dataObject = [];
    _.each(aggregatData, function (e) {
      var obj = {};
      obj.siteID = e.site.substring(e.site.length - 3, e.site.length);
      obj.dateGMT = moment.utc(moment.unix(e.epoch)).format('YY/MM/DD');
      obj.timeGMT = moment.utc(moment.unix(e.epoch)).format('HH:mm:ss');
      obj.status = 1;

      for (var subType in e.subTypes) {
        if (e.subTypes.hasOwnProperty(subType)) {
          var instruments = e.subTypes[subType];
          for (var instrument in instruments) {
            if (instruments.hasOwnProperty(instrument)) {
              var label = subType + '_' + instrument + '_channel';
              obj[label] = channelHash[subType + '_' + instrument]; // channel
              var data = instruments[instrument];
              label = subType + '_' + instrument + '_flag';
              obj[label] = flagsHash[_.last(data).val].label; // Flag
              label = subType + '_' + instrument + '_value';
              obj[label] = data[1].val.toFixed(3); // avg
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
      dataObject.push(obj);
    });

    var csv = Papa.unparse(dataObject);

    fs.writeFile(outputFile, csv, function (err) {
      if (err) {
        throw err;
      }
    });

    return dataObject;
  } else {
    logger.error('Could not find dir for AQSID: ', aqsid, ' in Sites.');
  }
});

Meteor.methods({
  exportData: function (site, startEpoch, endEpoch) {
    logger.info('Helper called export for site: ', site, ' and start: ', startEpoch, ' and end: ', endEpoch);
    return exportDataAsCSV(site, startEpoch, endEpoch);
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
    qry.$push[insertField].user = Meteor.user().emails[0].address; // user is doing the edit
    qry.$push[insertField].note = note;
    qry.$push[insertField].epoch = moment().unix();

    AggrData.update({
      _id: id,
    }, qry);

		// check whether it had been set to Q 

		// special treatment for Q flags (values will be set to zero)
    if (flag === 2) {
      //save the original value
      var object = AggrData.findOne({
        _id: id
      }).subTypes;
      let oldVal;

      for (var property in object) {
        if (object.hasOwnProperty(property)) {
          if (property === instrument) {
            const meas = measurement.split(/[ ]+/)[0];
            oldVal = object[property][meas][1].val;
            break;
          }
        }
      }

      // update avg with 0 for spans and keep the original value
      if (oldVal !== 0) {
				const updateQry = {};
	      updateQry[`${insertField}.1.val`] = 0;
        updateQry[`${insertField}.1.origVal`] = oldVal;
				AggrData.update({
	        _id: id,
	      }, {
	        $set: updateQry,
	      });
      }
    }
  }
});
