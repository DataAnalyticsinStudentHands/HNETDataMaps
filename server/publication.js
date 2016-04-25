// aggregation of live and aggregated data to be plotted with highstock
Meteor.publish('dataSeries', function (siteName, startEpoch, endEpoch) {

  var subscription = this;
  var pollData = {},
    poll5Data = {};

  let agg5Pipe = [{
    $match: {
      $and: [{
        site: siteName,
      }, {
        epoch: {
          $gt: parseInt(startEpoch, 10),
          $lt: parseInt(endEpoch, 10),
        },
      }],
    },
  }, {
    $sort: {
      epoch: 1,
    },
  }, {
    $group: {
      _id: '$siteName',

      series: {
        $push: {
          'subTypes': '$subTypes',
          'epoch': '$epoch',
        },
      },
    },
  }, ];

  AggrData.aggregate(agg5Pipe, function (err, result) {
      // create new structure for data series to be used for charts
      if (result.length > 0) {
        var lines = result[0].series;
        _.each(lines, function (line) {
          var epoch = line.epoch;
          _.each(line.subTypes, function (subKey, subType) { // subType is O3, etc.
            if (!poll5Data[subType]) {
              poll5Data[subType] = {};
            }
            _.each(subKey, function (sub, key) { // sub is the array with metric/val pairs as subarrays
              if (!poll5Data[subType][key]) { // create placeholder if not exists
                poll5Data[subType][key] = [];
              }
              if (_.last(sub).metric.indexOf('Flag') >= 0) { // get all measurements
                var datapoint = {
                  x: epoch * 1000,
                  y: sub[1].val,
                  color: flagsHash[_.last(sub).val].color, // the last element contains the latest flag
                  name: _.last(sub).val // will use the name of the point to hold the flag value
                }; // milliseconds
                poll5Data[subType][key].push(datapoint);
              }
            });
          });
        });

        for (var pubKey in poll5Data) { // pubKey equals instrument
          if (poll5Data.hasOwnProperty(pubKey)) {
            for (var key in poll5Data[pubKey]) { //key equals measurement
              // skip loop if the property is from prototype
              if (!poll5Data[pubKey].hasOwnProperty(key)) continue;

              // create yAxis object
              let yAxis = {};
              if (pubKey.indexOf('RMY') >= 0) { // special treatment for wind instruments
                yAxis = { // Primary yAxis
                  labels: {
                    format: '{value} ' + unitsHash[key],
                  },
                  title: {
                    text: key,
                  },
                  opposite: false,
                  floor: 0,
                  ceiling: 360,
                  tickInterval: 90,
                };
              } else {
                yAxis = { // Primary yAxis
                  labels: {
                    format: '{value} ' + unitsHash[key],
                  },
                  title: {
                    text: key,
                  },
                  opposite: false,
                  floor: 0,
                };
              }

              subscription.added('dataSeries', `${pubKey}_${key}_5m`, {
                name: key + '_5m',
                chartType: 'scatter',
                marker: {
                  enabled: true,
                  radius: 2,
                },
                lineWidth: 0,
                allowPointSelect: 'true',
                data: poll5Data[pubKey][key],
                zIndex: 2,
                yAxis: yAxis,
              });
            }
          }
        }
      }
    },
    function (error) {
      Meteor._debug('error during 5min publication aggregation: ' + error);
    }
  );

  var aggPipe = [{
    $match: {
      $and: [{
        site: siteName,
      }, {
        epoch: {
          $gt: parseInt(startEpoch, 10),
          $lt: parseInt(endEpoch, 10)
        }
      }]
    }
  }, {
    $sort: {
      epoch: 1
    }
  }, {
    $project: {
      epoch: 1,
      subTypes: 1,
      _id: 0
    }
  }];

  LiveData.aggregate(aggPipe, function (err, results) {
      // create new structure for data series to be used for charts
      _.each(results, function (line) {
        var epoch = line.epoch;
        _.each(line.subTypes, function (subKey, subType) { // subType is O3, etc.
          if (!pollData[subType]) {
            pollData[subType] = {};
          }
          _.each(subKey, function (sub) { // sub is the array with metric/val pairs as subarrays
            if (sub.metric !== 'Flag') {
              if (!pollData[subType][sub.metric]) {
                pollData[subType][sub.metric] = [];
              }
              var xy = [epoch * 1000, sub.val]; // milliseconds
              if (isNaN(sub.val) || sub.val === '') {
                xy = [epoch * 1000, null];
              }
              pollData[subType][sub.metric].push(xy);
            }
          });
        });
      });

      for (var pubKey in pollData) {
        // skip loop if the property is from prototype
        if (pollData.hasOwnProperty(pubKey)) {
          var chartType = 'line';
          // wind data should never be shown as line
          if (pubKey.indexOf('RMY') >= 0) {
            chartType = 'scatter';
          }

          for (var key in poll5Data[pubKey]) {
            // skip loop if the property is from prototype
            if (!poll5Data[pubKey].hasOwnProperty(key)) continue;

            // create yAxis object
            let yAxis = {};
            if (pubKey.indexOf('RMY') >= 0) { // special treatment for wind instruments
              yAxis = { // Primary yAxis
                labels: {
                  format: '{value} ' + unitsHash[key],
                },
                title: {
                  text: key,
                },
                opposite: false,
                floor: 0,
                ceiling: 360,
                tickInterval: 90,
              };
            } else {
              yAxis = { // Primary yAxis
                labels: {
                  format: '{value} ' + unitsHash[key],
                },
                title: {
                  text: key,
                },
                opposite: false,
                floor: 0,
              };
            }

            subscription.added('dataSeries', `${pubKey}_${key}_10s`, {
              name: key + '_10s',
              chartType: chartType,
              marker: {
                enabled: true,
                radius: 2,
              },
              lineWidth: 1,
              allowPointSelect: 'false',
              data: poll5Data[pubKey][key],
              zIndex: 1,
              yAxis: yAxis,
            });
          }
        }
      }
    },
    function (error) {
      Meteor._debug('error during livedata publication aggregation: ' + error);
    }
  );
});

// aggregation of composite aggregated data to be plotted with highstock
Meteor.publish('compositeSeries', function (siteList, startEpoch, endEpoch) {

  var subscription = this;
  var poll5Data = {};

  var agg5Pipe = [{
    $match: {
      $and: [{
        site: {
          $in: siteList
        }
      }, {
        epoch: {
          $gt: parseInt(startEpoch, 10),
          $lt: parseInt(endEpoch, 10)
        }
      }]
    }
  }, {
    $limit: 5 // testingpubsub
  }, {
    $sort: {
      epoch: 1
    }
  }, {
    $group: {
      _id: '$subTypes'
        //                series: {
        //                    $push: {
        //                        'subTypes': '$subTypes',
        //                        'epoch': '$epoch'
        //                    }
        //                }
    }
  }];

  AggrData.aggregate(agg5Pipe, function (err, result) {
      // create new structure for data series to be used for charts
      if (result.length > 0) {
        _.each(result, function (line) {
          var epoch = line.epoch;
          _.each(line.subTypes, function (subKey, subType) { // subType is O3, etc.
            if (!poll5Data[subType]) {
              poll5Data[subType] = {};
            }
            _.each(subKey, function (sub, key) { // sub is the array with metric/val pairs as subarrays
              if (!poll5Data[subType][key]) { // create placeholder if not exists
                poll5Data[subType][key] = [];
              }

              if (key !== 'Flag') {
                var datapoint = {
                  x: epoch * 1000,
                  y: sub[1].val,
                  color: flagsHash[_.last(sub).val].color
                }; // milliseconds
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

Meteor.publish('sites', function () {
  return Sites.find({
    'incoming': {
      $exists: true
    }
  });
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
