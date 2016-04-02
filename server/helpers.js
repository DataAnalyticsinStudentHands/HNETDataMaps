//required packages
var fs = Meteor.npmRequire('fs');

var exportDataAsCSV = Meteor.bindEnvironment(function (aqsid, startEpoch, endEpoch) {

    var dir = Sites.find({
        AQSID: aqsid
    }).fetch()[0];

    if (dir !== undefined) {

        //output folder
        var siteName = dir.incoming.match(/[^_]*/);
        var outputFile = '/hnet/outgoing/2016/' + dir.incoming + '/' + siteName + moment.unix(startEpoch).format('YYMMDDHHmmss') + '.uh';

        var aggregatData = AggrData.find({
            $and: [{
                epoch: {
                    $gt: parseInt(startEpoch, 10),
                    $lt: parseInt(endEpoch, 10)
                }
                }, {
                site: aqsid
                }]
        }).fetch();

        var dataObject = [];
        _.each(aggregatData, function (e) {
            var obj = {};
            obj.siteID = e.site.substring(e.site.length - 3, e.site.length);
            obj.dateGMT = moment.unix(e.epoch).format('YY/MM/DD');
            obj.timeGMT = moment.utc(moment.unix(e.epoch)).format('HH:mm:ss');
            obj.status = 1;

            for (var subType in e.subTypes) {
                if (e.subTypes.hasOwnProperty(subType)) {
                    var instruments = e.subTypes[subType];
                    for (var instrument in instruments) {
                        if (instruments.hasOwnProperty(instrument)) {
                            var label = subType + '_' + instrument + '_channel';
                            obj[label] = channelHash[subType + '_' + instrument]; //channel
                            var data = instruments[instrument];
                            label = subType + '_' + instrument + '_flag';
                            obj[label] = flagsHash[_.last(data).val].label; //Flag
                            label = subType + '_' + instrument + '_value';
                            obj[label] = data[1].val.toFixed(3); //avg
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
    insertUpdateFlag: function (siteId, epoch, instrument, measurement, flag) {
        //id that will receive the update
        var id = siteId + '_' + epoch / 1000; //seconds
        //new field
        var insertField = 'subTypes.' + instrument + '.' + measurement.split(/[ ]+/)[0];
        //update value
        var qry = {};
        qry.$push = {};
        qry.$push[insertField] = {};
        qry.$push[insertField].val = flag;
        qry.$push[insertField].metric = 'Overwrite Flag';
        qry.$push[insertField].user = Meteor.user().emails[0].address; //user is doing the edit
        qry.$push[insertField].note = 'test';
        AggrData.update({
            _id: id
        }, qry);
    }
});