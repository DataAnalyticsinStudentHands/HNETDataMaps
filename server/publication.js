var flagColors = ['white', 'red', 'orange', 'orange', 'orange', 'orange', 'white', 'white', 'grey', 'black'];

Meteor.publish('aggregatedata5min', function (site, startEpoch, endEpoch) {
    return AggrData.find({
        site: site
    }, {
        epoch: {
            $gt: parseInt(startEpoch, 10),
            $lt: parseInt(endEpoch, 10)
        }
    });
});

//aggregation of live and aggregated data to be plotted with highstock
Meteor.publish('dataSeries', function (site, startEpoch, endEpoch) {

    var subscription = this;
    var pollData = {},
        poll5Data = {};

    var agg5Pipe = [
        {
            $match: {
                $and: [{
                        site: site
                    },
                    {
                        epoch: {
                            $gt: parseInt(startEpoch, 10),
                            $lt: parseInt(endEpoch, 10)
                        }
                    }]
            }
        },
//       {
//            $limit: 5 //testingpubsub
//        },
        {
            $sort: {
                epoch: 1
            }
        },
        {
            $group: {
                _id: '$site',

                series: {
                    $push: {
                        'subTypes': '$subTypes',
                        'epoch': '$epoch'
                    }
                }
            }
        }
	];

    AggrData.aggregate(agg5Pipe, function (err, result) {
            //create new structure for data series to be used for charts
            if (result.length > 0) {
                var lines = result[0].series;
                _.each(lines, function (line) {
                    var epoch = line.epoch;
                    _.each(line.subTypes, function (subKey, subType) { //subType is O3, etc.              
                        if (!poll5Data[subType]) {
                            poll5Data[subType] = {};
                        }
                        _.each(subKey, function (sub, key) { //sub is the array with metric/val pairs as subarrays
                            if (!poll5Data[subType][key]) { //create placeholder if not exists
                                poll5Data[subType][key] = [];
                            }
                            if (_.last(sub).metric.indexOf('Flag') >= 0) { //get all measurements
                                var datapoint = {
                                    x: epoch * 1000,
                                    y: sub[1].val,
                                    color: flagColors[_.last(sub).val], //the last element contains the latest flag
                                    name: _.last(sub).val //will use the name of the point to hold the flag value
                                }; //milliseconds
                                poll5Data[subType][key].push(datapoint);
                            }
                        });
                    });
                });

                for (var pubKey in poll5Data) {
                    if (poll5Data.hasOwnProperty(pubKey)) {
                        subscription.added('dataSeries', pubKey + '_5m', {
                            subType: pubKey,
                            chartType: 'scatter',
                            lineWidth: 0,
                            allowPointSelect: 'true',
                            datapoints: poll5Data[pubKey],
                            zIndex: 2
                        });
                    }
                }

            }
        },
        function (error) {
            Meteor._debug('error during 5min publication aggregation: ' + error);
        }
    );


    var aggPipe = [
        {
            $match: {
                $and: [{
                        site: site
                    },
                    {
                        epoch: {
                            $gt: parseInt(startEpoch, 10),
                            $lt: parseInt(endEpoch, 10)
                        }
                    }]
            }
        },
//        {
//            $limit: 5 //testingpubsub
//        },
        {
            $sort: {
                epoch: 1
            }
        },
        {
            $project: {
                epoch: 1,
                subTypes: 1,
                _id: 0
            }
        }
	];

    LiveData.aggregate(aggPipe, function (err, results) {
            //create new structure for data series to be used for charts
            _.each(results, function (line) {
                var epoch = line.epoch;
                _.each(line.subTypes, function (subKey, subType) { //subType is O3, etc.
                    if (!pollData[subType]) {
                        pollData[subType] = {};
                    }
                    _.each(subKey, function (sub) { //sub is the array with metric/val pairs as subarrays
                        //if(subType==subTypName){ //reduces amount going to browser

                        if (sub.metric !== 'Flag') {
                            if (!pollData[subType][sub.metric]) {
                                pollData[subType][sub.metric] = [];
                            }

                            var xy = [epoch * 1000, sub.val]; //milliseconds
                            if (isNaN(sub.val)) {
                                xy = [epoch * 1000, null];
                            }
                            pollData[subType][sub.metric].push(xy);
                        }
                    });
                });
            });

            for (var pubKey in pollData) {
                if (pollData.hasOwnProperty(pubKey)) {
                    var chartType = 'line';
                    //wind data should never be shown as line
                    if (pubKey.indexOf('Wind') >= 0) {
                        chartType = 'scatter';
                    }
                    subscription.added('dataSeries', pubKey + '_10s', {
                        subType: pubKey,
                        chartType: chartType,
                        lineWidth: 1,
                        allowPointSelect: 'false',
                        datapoints: pollData[pubKey],
                        zIndex: 1
                    });
                }
            }

        },
        function (error) {
            Meteor._debug('error during livedata publication aggregation: ' + error);
        }
    );
});

//aggregation of composite aggregated data to be plotted with highstock
Meteor.publish('compositeSeries', function (siteList, startEpoch, endEpoch) {

    var subscription = this;
    var poll5Data = {};

    var agg5Pipe = [
        {
            $match: {
                $and: [{
                        site: {
                            $in: siteList
                        }
                    },
                    {
                        epoch: {
                            $gt: parseInt(startEpoch, 10),
                            $lt: parseInt(endEpoch, 10)
                        }
                    }]
            }
        },
        {
            $limit: 5 //testingpubsub
        },
        {
            $sort: {
                epoch: 1
            }
        },
        {
            $group: {
                _id: '$subTypes'
                    //                series: {
                    //                    $push: {
                    //                        'subTypes': '$subTypes',
                    //                        'epoch': '$epoch'
                    //                    }
                    //                }
            }
        }
	];

    AggrData.aggregate(agg5Pipe, function (err, result) {
            //create new structure for data series to be used for charts
            if (result.length > 0) {
                _.each(result, function (line) {
                    var epoch = line.epoch;
                    _.each(line.subTypes, function (subKey, subType) { //subType is O3, etc.              
                        if (!poll5Data[subType]) {
                            poll5Data[subType] = {};
                        }
                        _.each(subKey, function (sub, key) { //sub is the array with metric/val pairs as subarrays
                            if (!poll5Data[subType][key]) { //create placeholder if not exists
                                poll5Data[subType][key] = [];
                            }

                            if (key !== 'Flag') {
                                var datapoint = {
                                    x: epoch * 1000,
                                    y: sub[1].val,
                                    color: flagColors[sub[3].val]
                                }; //milliseconds
                                poll5Data[subType][key].push(datapoint);
                            }
                        });
                    });
                });

                for (var pubKey in poll5Data) {
                    if (poll5Data.hasOwnProperty(pubKey)) {
                        subscription.added('dataSeries', pubKey + '_5m', {
                            subType: pubKey,
                            chartType: 'scatter',
                            lineWidth: 0,
                            allowPointSelect: 'true',
                            datapoints: poll5Data[pubKey],
                            zIndex: 2
                        });
                    }
                }

            }
        },
        function (error) {
            Meteor._debug('error during 5min publication aggregation: ' + error);
        }
    );
});

Meteor.publish('monitors', function (latLng) {
    return Monitors.find({
        'loc': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: latLng
                },
                $maxDistance: 80000
            }
        }
    });
});

Meteor.publish('sites', function () {
    return Sites.find({});
});

Meteor.publish('userData', function () {
    if (this.userId) {
        return Meteor.users.find({
            _id: this.userId
        }, {
            fields: {
                'other': 1,
                'things': 1
            }
        });
    } else {
        this.ready();
    }
});