//required packages
var converter = Meteor.npmRequire('json-2-csv');
var fs = Meteor.npmRequire('fs');
var logger = Meteor.npmRequire('winston'); // this retrieves default logger which was configured in server.js

var exportDataAsCSV = Meteor.bindEnvironment(function (aqsid, startEpoch, endEpoch) {

    var dir = Monitors.find({
        AQSID: aqsid
    }).fetch()[0];

    if (dir !== undefined) {

        //output folder
        var siteName = dir.incoming.match(/[^_]*/);
        var outputFile = '/hnet/outgoing/2015/' + dir.incoming + '/' + siteName + moment.unix(startEpoch).format('YYMMDDHHmmss') + '.uh';

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
            obj.BIT = 1;
            obj.o3_channel = 25;
            
            for (var subType in e.subTypes) {
                if (e.subTypes.hasOwnProperty(subType)) {
                    var instruments = e.subTypes[subType];
                    for (var instrument in instruments) {
                        if (instruments.hasOwnProperty(instrument)) {
                            logger.info('instrument: ', subType);
                            var data = instruments[instrument];
                            logger.info('data: ', instrument);
                            var label = subType + '_' + instrument + '_flag';
                            obj[label] = data[3].val.toFixed(3); //Flag
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
        
        logger.info('Data: ', dataObject);

        converter.json2csv(dataObject, function (err, csv) {
            if (err) {
                console.log(err);
            }
            //console.log(csv);
            fs.writeFile(outputFile, csv, function (err) {
                if (err) {
                    throw err;
                }
                console.log('file saved');
            });
        });
        
        return dataObject;
    } else {
        logger.info('Could not find dir for AQSID: ', aqsid, ' in Monitors.');
    }

});

Meteor.methods({
    exportData: function (site, startEpoch, endEpoch) {
        logger.info('Helper called export for site: ', site, ' and start: ', startEpoch, ' and end: ', endEpoch);
        return exportDataAsCSV(site, startEpoch, endEpoch);
    }
});