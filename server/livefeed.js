//required packages
var chokidar = Meteor.npmRequire('chokidar');
var csvmodule = Meteor.npmRequire('csv');
var fs = Meteor.npmRequire('fs');
var logger = Meteor.npmRequire('winston'); // this retrieves default logger which was configured in server.js

var perform5minAggregat = function (siteId, startEpoch, endEpoch) {

    //gather all data, group by 5min epoch
    var pipeline = [
        {
            $match: {
                $and: [{
                    epoch: {
                        $gt: parseInt(startEpoch, 10),
                        $lt: parseInt(endEpoch, 10)
                    }
                }, {
                    site: siteId
                }]
            }
        },
//        {
//            $limit: 5 //testing only!
//        },
        {
            $project: {
                epoch5min: 1,
                epoch: 1,
                site: 1,
                subTypes: 1
            }
        },
        {
            $group: {
                _id: '$epoch5min',
                site: {
                    $last: '$site'
                },
                subTypes: {
                    $push: '$subTypes'
                }
            }
        }
     ];

    LiveData.aggregate(pipeline,
        Meteor.bindEnvironment(
            function (err, result) {
                _.each(result, function (e) {
                    var subObj = {};
                    subObj._id = e.site + '_' + e._id;
                    subObj.site = e.site;
                    subObj.epoch = e._id;
                    var subTypes = e.subTypes;
                    var aggrSubTypes = {}; //hold subTypes
                    for (var i = 0; i < subTypes.length; i++) {
                        for (var subType in subTypes[i]) {
                            if (subTypes[i].hasOwnProperty(subType)) {
                                var data = subTypes[i][subType];
                                var newkey;
                                var numValid = 1;
                                if (data[0].val !== 1) { //if flag is not 1 (valid) don't increase numValid
                                    numValid = 0;
                                }
                                //special calculation for wind data
                                if (subType.indexOf('Wind') >= 0) {
                                    //get windDir and windSpd
                                    var windDir, windSpd;
                                    for (var j = 1; j < data.length; j++) {
                                        if (data[j].val === '') {
                                            numValid = 0;
                                        }
                                        if (data[j].metric === 'Direction') {
                                            windDir = data[j].val;
                                        }
                                        if (data[j].metric === 'Speed') {
                                            windSpd = data[j].val;
                                        }
                                    }
                                    //Convert wind speed and wind direction waves into wind north and east component vectors
                                    var windNord = Math.cos(windDir / 180 * Math.PI) * windSpd;
                                    var windEast = Math.sin(windDir / 180 * Math.PI) * windSpd;

                                    //Aggregate data points
                                    newkey = subType + '_' + 'Wind';
                                    if (!aggrSubTypes[newkey]) {
                                        aggrSubTypes[newkey] = {
                                            'sumWindNord': windNord,
                                            'sumWindEast': windEast,
                                            'avgWindNord': windNord,
                                            'avgWindEast': windEast,
                                            'numValid': numValid,
                                            'Flag': 1
                                        };
                                    } else {
                                        aggrSubTypes[newkey].numValid += numValid;
                                        aggrSubTypes[newkey].sumWindNord += windNord; //holds sum until end
                                        aggrSubTypes[newkey].sumWindEast += windEast;
                                        if (aggrSubTypes[newkey].numValid !== 0) {
                                            aggrSubTypes[newkey].avgWindNord = aggrSubTypes[newkey].sumWindNord / aggrSubTypes[newkey].numValid;
                                            aggrSubTypes[newkey].avgWindEast = aggrSubTypes[newkey].sumWindEast / aggrSubTypes[newkey].numValid;
                                        }
                                    }
                                    if ((aggrSubTypes[newkey].numValid / i) < 0.75) {
                                        aggrSubTypes[newkey].Flag = 0; //should discuss how to use
                                    }
                                }
                                //normal aggreagation for all other subTypes
                                else {
                                    for (var k = 1; k < data.length; k++) {
                                        numValid = 1;
                                        if (data[k].val === '') {
                                            numValid = 0;
                                        }
                                        newkey = subType + '_' + data[k].metric;
                                        if (!aggrSubTypes[newkey]) {
                                            aggrSubTypes[newkey] = {
                                                'sum': data[k].val,
                                                'avg': data[k].val,
                                                'numValid': numValid,
                                                'Flag': 1
                                            };
                                        } else {
                                            aggrSubTypes[newkey].numValid += numValid;
                                            if (data[k].val !== '') {
                                                aggrSubTypes[newkey].sum += data[k].val; //holds sum until end
                                            }
                                            if (aggrSubTypes[newkey].numValid !== 0) {
                                                aggrSubTypes[newkey].avg = aggrSubTypes[newkey].sum / aggrSubTypes[newkey].numValid;
                                            }

                                        }
                                        if ((aggrSubTypes[newkey].numValid / i) < 0.75) {
                                            aggrSubTypes[newkey].Flag = 0; //should discuss how to use
                                        }
                                    }
                                }
                            }
                        }
                    }
                    //transform aggregated data to generic data format using subtypes etc.
                    var newaggr = {};
                    for (var aggr in aggrSubTypes) {
                        if (aggrSubTypes.hasOwnProperty(aggr)) {
                            var split = aggr.lastIndexOf('_');
                            var instrument = aggr.substr(0, split);
                            var measurement = aggr.substr(split + 1);
                            if (!newaggr[instrument]) {
                                newaggr[instrument] = {};
                            }

                            var obj = aggrSubTypes[aggr];

                            if (measurement === 'Wind') { //special treatment for wind measurements 
                                if (!newaggr[instrument].Direction) {
                                    newaggr[instrument].Direction = [];
                                }
                                if (!newaggr[instrument].Speed) {
                                    newaggr[instrument].Speed = [];
                                }
                                var windDirAvg = (Math.atan2(obj.avgWindEast, obj.avgWindNord) / Math.PI * 180 + 360) % 360;
                                var windSpdAvg = Math.sqrt((obj.avgWindNord * obj.avgWindNord) + (obj.avgWindEast * obj.avgWindEast));

                                newaggr[instrument].Direction.push({
                                    metric: 'sum',
                                    val: 'Nan'
                                });
                                newaggr[instrument].Direction.push({
                                    metric: 'avg',
                                    val: windDirAvg
                                });
                                newaggr[instrument].Direction.push({
                                    metric: 'numValid',
                                    val: obj.numValid
                                });
                                newaggr[instrument].Direction.push({
                                    metric: 'Flag',
                                    val: obj.Flag
                                });

                                newaggr[instrument].Speed.push({
                                    metric: 'sum',
                                    val: 'Nan'
                                });
                                newaggr[instrument].Speed.push({
                                    metric: 'avg',
                                    val: windSpdAvg
                                });
                                newaggr[instrument].Speed.push({
                                    metric: 'numValid',
                                    val: obj.numValid
                                });
                                newaggr[instrument].Speed.push({
                                    metric: 'Flag',
                                    val: obj.Flag
                                });
                            } else { //all other measurements
                                if (!newaggr[instrument][measurement]) {
                                    newaggr[instrument][measurement] = [];
                                }
                                newaggr[instrument][measurement].push({
                                    metric: 'sum',
                                    val: obj.sum
                                });
                                newaggr[instrument][measurement].push({
                                    metric: 'avg',
                                    val: obj.avg
                                });
                                newaggr[instrument][measurement].push({
                                    metric: 'numValid',
                                    val: obj.numValid
                                });
                                newaggr[instrument][measurement].push({
                                    metric: 'Flag',
                                    val: obj.Flag
                                });
                            }
                        }
                    }

                    subObj.subTypes = newaggr;
                    AggrData.update({
                            _id: subObj._id
                        },
                        subObj, {
                            upsert: true
                        });
                });
            },
            function (error) {
                Meteor._debug('error during aggregation: ' + error);
            }
        )
    );
};

var makeObj = function (keys) {
    var obj = {};
    obj.subTypes = {};
    var metron = [];
    for (var key in keys) {
        if (keys.hasOwnProperty(key)) {
            var subKeys = key.split('_');
            if (subKeys.length > 1) { //skipping 'TheTime'
                var alphaSite = subKeys[0] + '_' + subKeys[1];
                var metric = subKeys[subKeys.length - 1]; //i.e. conc., direction, etc.
                var metrized = key.replace(alphaSite + '_', '');
                metron = metrized.replace('_' + metric, ''); //wind, O3, etc.
                var val = keys[key];
                if (!obj.subTypes[metron]) {
                    obj.subTypes[metron] = [{
                        metric: metric,
                        val: val
                }];
                } else {
                    if (metric === 'Flag') { //Flag should be always first
                        obj.subTypes[metron].unshift({
                            metric: metric,
                            val: val
                        });
                    } else {
                        obj.subTypes[metron].push({
                            metric: metric,
                            val: val
                        });
                    }
                }
            }
        }
    }

    return obj;
};

var batchLiveDataUpsert = Meteor.bindEnvironment(function (parsedLines, path) {
    //find the site information
    var pathArray = path.split('/');
    var parentDir = pathArray[pathArray.length - 2];
    var site = Monitors.find({
        incoming: parentDir
    }).fetch()[0];

    if (site.AQSID) {
        var allObjects = [];
        for (var k = 0; k < parsedLines.length; k++) {
            var singleObj = makeObj(parsedLines[k]); //add data in
            var epoch = ((parsedLines[k].TheTime - 25569) * 86400) + 6 * 3600;
            epoch = epoch - (epoch % 1); //rounding down
            singleObj.epoch = epoch;
            singleObj.epoch5min = epoch - (epoch % 300);
            singleObj.theTime = parsedLines[k].TheTime;
            singleObj.site = site.AQSID;
            singleObj.file = pathArray[pathArray.length - 1];
            singleObj._id = site.AQSID + '_' + epoch;

            allObjects.push(singleObj);
        }

        //using bulCollectionUpdate
        bulkCollectionUpdate(LiveData, allObjects, {
            callback: function () {

                var nowEpoch = moment().unix();
                var agoEpoch = moment.unix(nowEpoch).subtract(24, 'hours').unix();

                logger.info('LiveData updated for : ', site.AQSID, 'Calling aggr for epochs of the last 24 hours: ', agoEpoch, '-', nowEpoch);
                perform5minAggregat(site.AQSID, agoEpoch, nowEpoch);
            }
        });
    }
});


var readFile = Meteor.bindEnvironment(function (path) {

    fs.readFile(path, 'utf-8', function (err, output) {
        csvmodule.parse(output, {
            auto_parse: true,
            columns: true
        }, function (err, parsedLines) {
            if (err) {
                logger.error(err);
            }
            batchLiveDataUpsert(parsedLines, path);
        });
    });
});

Meteor.methods({
    new5minAggreg: function (siteId, startEpoch, endEpoch) {
        logger.info('Helper called 5minAgg for site: ', siteId, ' start: ', startEpoch, ' end: ', endEpoch);
        perform5minAggregat(siteId, startEpoch, endEpoch);
    },
    insertUpdateFlag: function (siteId, epoch, instrument, measurement, flag) {
        //id that will receive the update
        var id = siteId + '_' + epoch/1000; //seconds
        //new field
        var insertField = 'subTypes.' + instrument + '.' + measurement.split(/[ ]+/)[0];
        //update value
        var qry = {};
        qry.$push = {};
        qry.$push[insertField] = {};
        qry.$push[insertField].val = flag;
        qry.$push[insertField].metric = 'Overwrite Flag';
        qry.$push[insertField].user = 'peggy';
        qry.$push[insertField].note = 'test';
        AggrData.update({_id: id}, qry);
                       
        
    }
});

var liveWatcher = chokidar.watch('/hnet/incoming/2015', {
    ignored: /[\/\\]\./,
    ignoreInitial: true,
    usePolling: true,
    persistent: true
});

liveWatcher
    .on('add', function (path) {
        logger.info('File ', path, ' has been added.');
        readFile(path);
    })
    .on('change', function (path) {
        logger.info('File', path, 'has been changed');
        readFile(path);
    })
    .on('addDir', function (path) {
        logger.info('Directory', path, 'has been added');
    })
    .on('error', function (error) {
        logger.error('Error happened', error);
    })
    .on('ready', function () {
        logger.info('Ready for changes in /hnet/incoming/2015/.');
    });