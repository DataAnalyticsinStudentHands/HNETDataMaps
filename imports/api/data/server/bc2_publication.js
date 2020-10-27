import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check, Match } from 'meteor/check';
import { Promise } from 'meteor/promise';
import { AggrData } from '../../collections_server';

// aggregation bc2 data to be plotted with highstock
Meteor.publish('bc2DataSeries', function (siteName, startEpoch, endEpoch) {
  check(siteName, String);
  check(startEpoch, Match.Integer);
  check(endEpoch, Match.Integer);
  const subscription = this;
  const bc2siteData = {};

  const aggBc2Pipe = [
    {
      $match: { $and: [
          { site: siteName }, {
            epoch: {
              $gt: parseInt(startEpoch, 10),
              $lt: parseInt(endEpoch, 10)
            }
          }]
      }
    }, {
      $sort: {
        epoch: -1
      }
    }, {
      $group: {
        _id: { subTypes: '$subTypes', epoch: '$epoch' }
      }
    }
  ];

  // create new structure for bc2 data series to be used for charts
  const results = Promise.await(AggrData.rawCollection().aggregate(aggBc2Pipe).toArray());

  if (results.length > 0) {
    results.forEach((line) => {
      const epoch = line._id.epoch;
      _.each(line._id.subTypes, (data, instrument) => { 
         _.each(data, (points, measurement) => { // sub is the array with metric/val pairs as subarrays, measurement, WS etc. 
        let chart = measurement.toUpperCase();
        // organize data by instrument_measurements
        if (chart.includes('BACK')) {
          chart = `${instrument} Back Scattering`
        } else if (chart.includes('ABSCOEF')) {
          chart = `${instrument.substring(0, 3)} Absolute Coefficients`
        } else if (instrument.includes('tap')){
          chart = `${instrument.substring(0, 3)} Abs Coeff`
        } else {
          chart = `${instrument} Scattering`; 
        }
        if (!bc2siteData[chart]) { // create placeholder for measurement
          bc2siteData[chart] = {};
        }
        if (!bc2siteData[chart][measurement]) { // create placeholder for series if not exists
          bc2siteData[chart][measurement] = [];
        }

        if (_.last(points).val === 1) { // get all measurements where flag == 1
          let datapoint = {};
          datapoint = {
            x: epoch * 1000, // milliseconds
            y: points[1].val // average
          };
          bc2siteData[chart][measurement].push(datapoint);
        }
      });
      })
    });
  }

  Object.keys(bc2siteData).forEach((chart) => {
    if (Object.prototype.hasOwnProperty.call(bc2siteData, chart)) {
      const chartSeries = { charts: [] };
      Object.keys(bc2siteData[chart]).forEach((measurment) => {
        if (Object.prototype.hasOwnProperty.call(bc2siteData[chart], measurment)) {
          const dataSorted = bc2siteData[chart][measurment].sort((obj1, obj2) => {
            // Ascending: sorting by epoch?
            return obj1.x - obj2.x;
          });
          const series = {
            name: measurment,
            type: 'scatter',
            marker: {
              enabled: true,
              radius: 2,
              symbol: 'circle'
            },
            data: dataSorted
          };
          chartSeries.charts.push(series);
        }
      });

      subscription.added('bc2DataSeries', chart, chartSeries);
    }
  });
  this.ready();
});

//! This functionality can be used to merge tap1 and tap2 data
// _.each(line._id.subTypes, (data, instrument) => { // Instrument, Neph, tap_SNX etc.
//   if (instrument.substring(0, 3) == 'tap') {
//     _.each(data, (points, measurement) => {
//       let chart = measurement.toUpperCase();           
//       if (chart.includes('ABSCOEF')) {
//          let individualABS= tapTemp.tap ||{};
//         let individualABSmeasuement = individualABS[measurement] || {};
//         tapTemp['tap'] = { ...tapTemp['tap'], [measurement]: [...individualABSmeasuement, ...points] }
//       }
//        }
//      )    
// tapTemp['tap']= {...tapTemp['tap'],...data}
//   } else {
//     tapTemp[instrument] = data;
//   }     
// });
// console.log(tapTemp.tap);