import Highcharts from 'highcharts/highstock';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { moment } from 'meteor/momentjs:moment';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { CompositeCampusDataSeries } from '../../../api/collections_client';
import { unitsHash } from '../../../api/constants';

import './compositeCampus.html';

// 24 hours ago - seconds
const startEpoch = new ReactiveVar(moment().subtract(1439, 'minutes').unix());
const endEpoch = new ReactiveVar(moment().unix());

Highcharts.setOptions({
  global: {
    useUTC: false,
    getTimezoneOffset: (timestamp) => {
      const timezoneOffset = 0;
      return timezoneOffset;
    }
  }
});

Template.compositeCampus.onRendered(() => {
  // setup date picker
  this.$('#datetimepicker1').datetimepicker({
    format: 'MM/DD/YYYY',
    useCurrent: true,
    defaultDate: new Date(),
    widgetPositioning: {
      horizontal: 'left',
      vertical: 'auto'
    }
  });
});

Template.compositeCampus.onCreated(function() {
  this.autorun(() => {
    this.subscribe('compositeCampusDataSeries', startEpoch.get(), endEpoch.get(), () => {
      $('svg').delay(750).fadeIn();
      $('.loader').delay(1000).fadeOut('slow', () => {
        $('.loading-wrapper').fadeIn('slow');
      });
    });
  });
});

Template.compositeCampus.helpers({
  selectedDate() {
    return moment.unix(endEpoch.get()).format('YYYY-MM-DD');
  },
  charts() {
    console.log("hello");
    return CompositeCampusDataSeries.find();
  },
  createChart(measurement) {
    const data = CompositeCampusDataSeries.find({ _id: measurement }).fetch();

    // Use Meteor.defer() to create chart after DOM is ready:
    Meteor.defer(() => {
      if (document.getElementById(`container-chart-${measurement}`) !== null) {
      // Create standard Highcharts chart with options:
        const chart = Highcharts.StockChart(`container-chart-${measurement}`, {
          chart: {
            zoomType: 'x'
          },
          title: {
            text: measurement
          },
          xAxis: {
            type: 'datetime',
            title: {
              text: 'Local Time'
            },
            minRange: 3600
          },
          navigator: {
            xAxis: {
              dateTimeLabelFormats: {
                hour: '%e. %b'
              }
            }
          },
          yAxis: {
            allowDecimals: false,
            title: {
              text: unitsHash[measurement]
            },
            min: 0,
            opposite: false
          },
          series: data[0].charts,
          tooltip: {
            enabled: true,
            crosshairs: [true],
            positioner(labelWidth, labelHeight, point) {
              let tooltipX;
              let tooltipY;
              if (point.plotX + this.chart.plotLeft < labelWidth && point.plotY + labelHeight > this.chart.plotHeight) {
                tooltipX = this.chart.plotLeft;
                tooltipY = this.chart.plotTop + this.chart.plotHeight - (2 * labelHeight) - 10;
              } else {
                tooltipX = this.chart.plotLeft;
                tooltipY = this.chart.plotTop + this.chart.plotHeight - labelHeight;
              }
              return {
                x: tooltipX,
                y: tooltipY
              };
            },
            formatter() {
              let s = moment(this.x).format('YYYY/MM/DD HH:mm:ss');
              s += `<br/>${this.series.name} <b>${this.y.toFixed(2)}</b>`;
              return s;
            },
            shared: false
          },
          credits: {
            enabled: false
          },
          legend: {
            enabled: true,
            align: 'right',
            layout: 'vertical',
            verticalAlign: 'top',
            y: 100
          },
          rangeSelector: {
            inputEnabled: false,
            allButtonsEnabled: true,
            buttons: [{
              type: 'day',
              count: 1,
              text: '1 Day'
            }, {
              type: 'minute',
              count: 60,
              text: 'Hour'
            }],
            buttonTheme: {
              width: 60
            },
            selected: 0
          }
        });
      }
    });
  }
});

Template.compositeCampus.events({
  'dp.change #datetimepicker1'(event) {
    // Get the selected date
    startEpoch.set(moment(event.date, 'YYYY-MM-DD').unix());
    endEpoch.set(moment.unix(startEpoch.get()).add(1439, 'minutes').unix());
  }
});
