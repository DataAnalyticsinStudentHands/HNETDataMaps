import Highcharts from "highcharts/highstock";
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { moment } from "meteor/momentjs:moment";
import { Template } from "meteor/templating";
import { Bc2DataSeries } from "../../../api/collections_client";
import { unitsHash } from "../../../api/constants";
import { LiveSites } from "../../../api/collections_server";

import "./bc2site.html";

// 24 hours ago - seconds
const startEpoch = new ReactiveVar(moment().subtract(7, "days").unix());
const endEpoch = new ReactiveVar(moment().unix());

let currentEventDate = null 

Template.bc2site.onRendered(() => {
  // setup date picker
  this.$("#datetimepicker1").datetimepicker({
    format: "MM/DD/YYYY",
    useCurrent: true,
    defaultDate: new Date(),
    widgetPositioning: {
      horizontal: "left",
      vertical: "auto",
    },
  });
});

Template.bc2site.onCreated(function () {
  this.autorun(() => {
    this.subscribe(
      "bc2DataSeries",
      Router.current().params._id,
      startEpoch.get(),
      endEpoch.get(),
      () => {
        $("svg").delay(750).fadeIn();
        $(".loader")
          .delay(1000)
          .fadeOut("slow", () => {
            $(".loading-wrapper").fadeIn("slow");
          });
      }
    );
  });
});

Template.bc2site.helpers({
  sitename() {
    const site = LiveSites.findOne({ AQSID: Router.current().params._id });
    return site && site.siteName;
  },
  selectedDate() {
    return moment.unix(endEpoch.get()).format("YYYY-MM-DD");
  },
  charts() {
    return Bc2DataSeries.find();
  },
  createChart(measurement) {
    const data = Bc2DataSeries.find({ _id: measurement }).fetch();
    const allLiveSites = LiveSites.findOne({ AQSID: Router.current().params._id });
    
    // Use Meteor.defer() to create chart after DOM is ready:
    Meteor.defer(() => {
      if (document.getElementById(`container-chart-${measurement}`) !== null) {
        // Create standard Highcharts chart with options:
        const chart = Highcharts.StockChart(`container-chart-${measurement}`, {
          chart: {
            zoomType: "x",
          },
          title: {
            text: measurement,
          },
          xAxis: {
            type: "datetime",
            title: {
              text: "Local Time " + allLiveSites.city,
            },
            minRange: 3600,
          },
          time: {
            timezoneOffset: allLiveSites.GMToffset * 60,
            useUTC: false
          },
          navigator: {
            xAxis: {
              dateTimeLabelFormats: {
                hour: "%e. %b",
              },
            },
          },
          yAxis: {
            allowDecimals: false,
            title: {
              text: unitsHash[measurement],
            },
            min: 0,
            opposite: false,
          },
          series: data[0].charts,
          plotOptions: {
            series: {
              turboThreshold: 5000, // added this to increase the limit of data extraction
            },
          },
          tooltip: {
            enabled: true,
            crosshairs: [true],
            positioner(labelWidth, labelHeight, point) {
              let tooltipX;
              let tooltipY;
              if (
                point.plotX + this.chart.plotLeft < labelWidth &&
                point.plotY + labelHeight > this.chart.plotHeight
              ) {
                tooltipX = this.chart.plotLeft;
                tooltipY =
                  this.chart.plotTop +
                  this.chart.plotHeight -
                  2 * labelHeight -
                  10;
              } else {
                tooltipX = this.chart.plotLeft;
                tooltipY =
                  this.chart.plotTop + this.chart.plotHeight - labelHeight;
              }
              return {
                x: tooltipX,
                y: tooltipY,
              };
            },
            formatter() {
              let s = moment(this.x).format("YYYY/MM/DD HH:mm:ss");
              s += `<br/>${this.series.name} <b>${this.y.toFixed(2)}</b>`;
              return s;
            },
            shared: false,
          },
          credits: {
            enabled: false,
          },
          legend: {
            enabled: true,
            align: "right",
            layout: "vertical",
            verticalAlign: "top",
            y: 100,
          },
          rangeSelector: {
            inputEnabled: false,
            allButtonsEnabled: true,
            buttons: [
              {
                type: "day",
                count: 1,
                text: "1 Day",
              },
              {
                type: "minute",
                count: 60,
                text: "Hour",
              },
              {
                type: "day",
                count: 7,
                text: "Load 1 week",
                events: {
                  click: function () {
                    if(currentEventDate){
                      if(measurement){
                        startEpoch.set(moment(currentEventDate, "YYYY-MM-DD").subtract(7, 'days').unix());
                        endEpoch.set(moment(currentEventDate, "YYYY-MM-DD").add(1, 'days').unix());
                      }
                    }
                  }
                }
              },
            ],
            buttonTheme: {
              width: 100,
            },
            selected: 0,
          },
        });
      }
    });
  },
});

Template.bc2site.events({
  // set y-axis min/max from form
  "submit .adjust": function (event) {
    // Prevent default browser form submit
    event.preventDefault();
    // find axis of graph
    const target = event.target;
    const index = $(`#container-chart-${target.id}`).data("highchartsChart");
    const chart = Highcharts.charts[index];
    const yAxis = chart.yAxis[0];
    // Set value from form element
    yAxis.setExtremes(target.min.value, target.max.value);
  },
  "dp.change #datetimepicker1": function (event) {
    // Get the selected date
    currentEventDate = event.date;
    startEpoch.set(moment(event.date, "YYYY-MM-DD").unix());
    endEpoch.set(moment.unix(startEpoch.get()).add(1439, "minutes").unix());
  },
});
