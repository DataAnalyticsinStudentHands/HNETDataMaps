//required packages
var csvmodule = Meteor.npmRequire('csv');
var fs = Meteor.npmRequire('fs');

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
                    var aggrSubTypes = {}; //hold aggregated data

                    for (var i = 0; i < subTypes.length; i++) {
                        for (var subType in subTypes[i]) {
                            if (subTypes[i].hasOwnProperty(subType)) {
                                var data = subTypes[i][subType];
                                var numValid = 1;
                                var newkey;

                                if (data[0].val === '') { //if flag is not existing, put 1 as default, need to ask Jim?
                                    data[0].val = 1;
                                }
                                if (data[0].val !== 1) { //if flag is not 1 (valid) don't increase numValid
                                    numValid = 0;
                                }
                                var j;

                                if (subType.indexOf('RMY') >= 0) { //special calculation for wind data
                                    //get windDir and windSpd
                                    var windDir, windSpd;
                                    for (j = 1; j < data.length; j++) {
                                        if (data[j].val === '') { //taking care of empty data values
                                            numValid = 0;
                                        }
                                        if (data[j].metric === 'WD') {
                                            windDir = data[j].val;
                                        }
                                        if (data[j].metric === 'WS') {
                                            windSpd = data[j].val;
                                        }
                                    }
                                    //Convert wind speed and wind direction waves into wind north and east component vectors
                                    var windNord = Math.cos(windDir / 180 * Math.PI) * windSpd;
                                    var windEast = Math.sin(windDir / 180 * Math.PI) * windSpd;

                                    //Aggregate data points
                                    newkey = subType + '_' + 'RMY';
                                    if (!aggrSubTypes[newkey]) {
                                        aggrSubTypes[newkey] = {
                                            'sumWindNord': windNord,
                                            'sumWindEast': windEast,
                                            'avgWindNord': windNord,
                                            'avgWindEast': windEast,
                                            'numValid': numValid,
                                            'totalCounter': 1, //initial total counter
                                            'flagstore': [data[0].val] //store all incoming flags in case we need to evaluate
                                        };
                                    } else {
                                        if (numValid !== 0) { //taking care of empty data values
                                            aggrSubTypes[newkey].numValid += numValid;
                                            aggrSubTypes[newkey].sumWindNord += windNord; //holds sum until end
                                            aggrSubTypes[newkey].sumWindEast += windEast;
                                            aggrSubTypes[newkey].avgWindNord = aggrSubTypes[newkey].sumWindNord / aggrSubTypes[newkey].numValid;
                                            aggrSubTypes[newkey].avgWindEast = aggrSubTypes[newkey].sumWindEast / aggrSubTypes[newkey].numValid;
                                        }
                                        aggrSubTypes[newkey].totalCounter += 1; //increase counter
                                        aggrSubTypes[newkey].flagstore.push(data[0].val); //store incoming flag 
                                    }
                                } else { //normal aggreagation for all other subTypes
                                    for (j = 1; j < data.length; j++) {
                                        newkey = subType + '_' + data[j].metric;

                                        if (data[j].val === '') { //taking care of empty data values
                                            numValid = 0;
                                        }
                                        if (!aggrSubTypes[newkey]) {
                                            aggrSubTypes[newkey] = {
                                                'sum': Number(data[j].val),
                                                'avg': Number(data[j].val),
                                                'numValid': numValid,
                                                'totalCounter': 1, //initial total counter
                                                'flagstore': [data[0].val] //store all incoming flags in case we need to evaluate
                                            };
                                        } else {
                                            if (data[j].val !== '') { //taking care of empty data values
                                                aggrSubTypes[newkey].numValid += numValid;
                                                aggrSubTypes[newkey].sum += Number(data[j].val); //holds sum until end
                                                if (aggrSubTypes[newkey].numValid !== 0) {
                                                    aggrSubTypes[newkey].avg = aggrSubTypes[newkey].sum / aggrSubTypes[newkey].numValid;
                                                }
                                            }
                                            aggrSubTypes[newkey].totalCounter += 1; //increase counter
                                            aggrSubTypes[newkey].flagstore.push(data[0].val); ///store incoming flag
                                        }
                                        numValid = 1; //reset numvalid
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

                            var obj = aggrSubTypes[aggr]; //makes it a liitle bit easier

                            //dealing with flags
                            if ((obj.numValid / obj.totalCounter) >= 0.75) {
                                obj.Flag = 1; //valid
                            } else {
                                //found out which flag was majority
                                var counts = {};
                                for (var k = 0; k < obj.flagstore.length; k++) {
                                    counts[obj.flagstore[k]] = 1 + (counts[obj.flagstore[k]] || 0);
                                }
                                var maxObj = _.max(counts, function (obj) {
                                    return obj;
                                });
                                var majorityFlag = (_.invert(counts))[maxObj];
                                obj.Flag = majorityFlag; 
                            }

                            if (measurement === 'RMY') { //special treatment for wind measurements 
                                if (!newaggr[instrument].WD) {
                                    newaggr[instrument].WD = [];
                                }
                                if (!newaggr[instrument].WS) {
                                    newaggr[instrument].WS = [];
                                }
                                var windDirAvg = (Math.atan2(obj.avgWindEast, obj.avgWindNord) / Math.PI * 180 + 360) % 360;
                                var windSpdAvg = Math.sqrt((obj.avgWindNord * obj.avgWindNord) + (obj.avgWindEast * obj.avgWindEast));
                                
                                //set average to 0 for spans
                                if (obj.Flag === 2 || obj.Flag === 3 || obj.Flag === 4 || obj.Flag === 5) {
                                    windDirAvg = 0;
                                    windSpdAvg = 0;
                                }

                                newaggr[instrument].WD.push({
                                    metric: 'sum',
                                    val: 'Nan'
                                });
                                newaggr[instrument].WD.push({
                                    metric: 'avg',
                                    val: windDirAvg
                                });
                                newaggr[instrument].WD.push({
                                    metric: 'numValid',
                                    val: obj.numValid
                                });
                                newaggr[instrument].WD.push({
                                    metric: 'Flag',
                                    val: obj.Flag
                                });

                                newaggr[instrument].WS.push({
                                    metric: 'sum',
                                    val: 'Nan'
                                });
                                newaggr[instrument].WS.push({
                                    metric: 'avg',
                                    val: windSpdAvg
                                });
                                newaggr[instrument].WS.push({
                                    metric: 'numValid',
                                    val: obj.numValid
                                });
                                newaggr[instrument].WS.push({
                                    metric: 'Flag',
                                    val: obj.Flag
                                });
                            } else { //all other measurements
                                //set average to 0 for spans
                                if (obj.Flag === "2" || obj.Flag === "3" || obj.Flag === "4" || obj.Flag === "5") {
                                    obj.avg = 0;
                                }
                                
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
            //Fix for wrong headers _Wind
            var newKey = key;
            if (key.indexOf('_Wind') >= 0) {
                newKey = key.replace('_Wind', '');
            }
            var subKeys = newKey.split('_'); //split each column header
            if (subKeys.length > 1) { //skipping 'TheTime'
                metron = subKeys[2]; //instrument i.e. wind, O3, etc.
                var metric = subKeys[3]; //
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
    var site = Sites.find({
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
    }
});

var liveWatcher = chokidar.watch('/hnet/incoming/2016', {
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
        logger.info('Ready for changes in /hnet/incoming/2016/.');
    });