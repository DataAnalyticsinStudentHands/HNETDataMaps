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
var startEpoch = new ReactiveVar(moment().subtract(1439, 'minutes').unix());
var endEpoch = new ReactiveVar(moment().unix());

Highcharts.setOptions({
  global: {
    useUTC: false,
    getTimezoneOffset: (timestamp) => {
      const timezoneOffset = 0;
      return timezoneOffset;
    }
  }
});

Template.compositeCampus.onCreated(function() {
//  this.getListId = () => FlowRouter.getParam('_id');

  this.autorun(() => {
    this.subscribe('compositeCampusDataSeries', () => {
      $('.loader').delay(300).fadeOut('slow', () => {
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
    return CompositeCampusDataSeries.find();
  },
  createChart(test) {
    const data = CompositeCampusDataSeries.find({ _id: test }).fetch();

    // Use Meteor.defer() to create chart after DOM is ready:
    Meteor.defer(function() {

    // Create standard Highcharts chart with options:
      Highcharts.StockChart(`container-chart-${test}`, {
        exporting: {
          enabled: true
        },
        type: 'scatter',
        lineWidth: 0,
        chart: {
          zoomType: 'x'
        },
        title: {
          text: test
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
            text: unitsHash[test]
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
    });
  }
});

Template.compositeCampus.events({
  'change #datepicker' (event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
    endEpoch.set(moment.unix(startEpoch.get()).add(1439, 'minutes').unix());
  }
});

Template.compositeCampus.onRendered(() => {
  $('svg').delay(200).fadeIn();
});
