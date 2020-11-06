import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import { check, Match } from "meteor/check";
import { Promise } from "meteor/promise";
import { AggrData } from "../../collections_server";
import { flagsHash } from "../../constants";

// aggregation bc2 data to be plotted with highstock
Meteor.publish("bc2DataSeries", function (siteName, startEpoch, endEpoch) {
  check(siteName, String);
  check(startEpoch, Match.Integer);
  check(endEpoch, Match.Integer);
  const subscription = this;
  const bc2siteData = {};
  const aggBc2Pipe = [
    {
      $match: {
        $and: [
          { site: siteName },
          {
            epoch: {
              $gt: parseInt(startEpoch, 10),
              $lt: parseInt(endEpoch, 10),
            },
          },
        ],
      },
    },
    {
      $sort: {
        epoch: -1,
      },
    },
    {
      $group: {
        _id: { subTypes: "$subTypes", epoch: "$epoch" },
      },
    },
  ];

  // create new structure for bc2 data series to be used for charts
  const results = Promise.await(
    AggrData.rawCollection().aggregate(aggBc2Pipe).toArray()
  );
  let modifiedData = {};
  if (results.length > 0) {
    results.forEach((line) => {
      const epoch = line._id.epoch;
      _.each(line._id.subTypes, (data, instrument) => {
        _.each(data, (points, measurement) => {
          // sub is the array with metric/val pairs as subarrays, measurement, WS etc.
          let chart = measurement.toUpperCase();
          // organize data by instrument_measurements
          if (chart.includes("BACK")) {
            chart = `${instrument} Back Scattering`;
          } else if (chart.includes("ABSCOEF")) {
            chart = `${instrument.substring(0, 3)} Absolute Coefficients`;
          } else if (!instrument.includes("tap")) {
            chart = `${instrument} Scattering`;
          } else if (chart.includes("AIRTEMP")) {
            chart = `${measurement}`;
          } else {
            chart = [];
          }
          if (!bc2siteData[chart]) {
            // create placeholder for measurement
            bc2siteData[chart] = {};
          }
          if (!bc2siteData[chart][measurement]) {
            // create placeholder for series if not exists
            bc2siteData[chart][measurement] = [];
          }
          // get all measurements where flag == 1
          if (_.last(points).val === 1) {
            if (modifiedData[epoch * 1000]) {
              modifiedData[epoch * 1000] = {
                ...modifiedData[epoch * 1000],
                [instrument]: {
                  [measurement]: points[1],
                },
              };
            } else {
              modifiedData[epoch * 1000] = {
                [instrument]: {
                  [measurement]: points[1],
                },
              };
            }
            // console.log("points: ", points);
            if (points[1].val) {
              if (measurement.includes("Red")) {
                modifiedData = {
                  x: epoch * 1000, // milliseconds
                  y: points[1].val, // average
                  color: flagsHash[1].color,
                };
              } else if (measurement.includes("Blue")) {
                modifiedData = {
                  x: epoch * 1000, // milliseconds
                  y: points[1].val, // average
                  color: flagsHash[11].color,
                };
              } else if (measurement.includes("Green")) {
                modifiedData = {
                  x: epoch * 1000, // milliseconds
                  y: points[1].val, // average
                  color: flagsHash[12].color,
                };
              } else if (measurement.includes("CO")) {
                modifiedData = {
                  x: epoch * 1000, // milliseconds
                  y: points[1].val, // average
                  color: flagsHash[8].color,
                };
              } else if (measurement.includes("AirTemp")) {
                modifiedData = {
                  x: epoch * 1000, // milliseconds
                  y: points[1].val, // average
                  color: flagsHash[9].color,
                };
              } else {
                modifiedData = {
                  x: epoch * 1000, // milliseconds
                  y: points[1].val, // average
                  color: flagsHash[_.last(points).val].color,
                };
              }
            }
            bc2siteData[chart][measurement].push(modifiedData);
            // console.log("Modified Data: ", modifiedData);
          }
        });
      });
    });
  }

  Object.keys(bc2siteData).forEach((chart) => {
    if (Object.prototype.hasOwnProperty.call(bc2siteData, chart)) {
      const chartSeries = { charts: [] };
      Object.keys(bc2siteData[chart]).forEach((measurment) => {
        if (
          Object.prototype.hasOwnProperty.call(bc2siteData[chart], measurment)
        ) {
          const dataSorted = bc2siteData[chart][measurment].sort(
            (obj1, obj2) => {
              // Ascending: sorting by epoch?
              return obj1.x - obj2.x;
            }
          );
          const series = {
            name: measurment,
            type: "scatter",
            marker: {
              enabled: true,
              radius: 2,
              symbol: "circle",
            },
            data: dataSorted,
          };
          chartSeries.charts.push(series);
        }
      });

      subscription.added("bc2DataSeries", chart, chartSeries);
    }
  });
  this.ready();
});
