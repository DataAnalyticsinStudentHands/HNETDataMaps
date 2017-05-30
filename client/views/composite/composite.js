import Highcharts from 'highcharts/highstock';

// 24 hours ago - seconds
var startEpoch = new ReactiveVar(moment().subtract(1439, 'minutes').unix());
var endEpoch = new ReactiveVar(moment().unix());

Highcharts.setOptions({
  global: {
    useUTC: false,
    getTimezoneOffset: function (timestamp) {
      const timezoneOffset = 0;

      return timezoneOffset;
    }
  }
});

// placeholder for dynamic chart containers
const Charts = new Meteor.Collection(null);

/**
 * Create highstock based chart.
 */
function createChart(chartName, titleText, seriesOptions, yAxisOptions) {
  const mychart = new Highcharts.StockChart({
    exporting: {
      enabled: true,
    },
    chart: {
      zoomType: 'x',
      renderTo: chartName,
    },
    title: {
      text: titleText,
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Local Time',
      },
      minRange: 3600,
    },
    navigator: {
      xAxis: {
        dateTimeLabelFormats: {
          hour: '%e. %b',
        },
      },
    },
    yAxis: yAxisOptions,
    series: seriesOptions,
    tooltip: {
      enabled: true,
      crosshairs: [true],
      positioner(labelWidth, labelHeight, point) {
        let tooltipX;
        let tooltipY;
        if (point.plotX + this.chart.plotLeft < labelWidth && point.plotY + labelHeight > this.chart.plotHeight) {
          tooltipX = this.chart.plotLeft;
          tooltipY = this.chart.plotTop + this.chart.plotHeight - 2 * labelHeight - 10;
        } else {
          tooltipX = this.chart.plotLeft;
          tooltipY = this.chart.plotTop + this.chart.plotHeight - labelHeight;
        }
        return {
          x: tooltipX,
          y: tooltipY,
        };
      },
      formatter() {
        let s = moment(this.x).format('YYYY/MM/DD HH:mm:ss');
        s += '<br/>' + this.series.name + ' <b>' + this.y.toFixed(2) + '</b>';
        return s;
      },
      shared: false,
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: true,
      align: 'right',
      layout: 'vertical',
      verticalAlign: 'top',
      y: 100,
    },
    rangeSelector: {
      inputEnabled: false,
      allButtonsEnabled: true,
      buttons: [{
        type: 'day',
        count: 1,
        text: '1 Day',
      }, {
        type: 'minute',
        count: 60,
        text: 'Hour',
      }],
      buttonTheme: {
        width: 60,
      },
      selected: 0,
    },
  });
}

Template.composite.onRendered(function () {
  // Do reactive stuff when something is added or removed
  this.autorun(function () {
    // Subscribe
    Meteor.subscribe('compositeDataSeries', startEpoch.get(), endEpoch.get());
    Charts.remove({});

    let initializing = true;

    CompositeDataSeries.find().observeChanges({
      added: function (series, seriesData) {
        if (!initializing) { // true only when we first start
          const measurement = series.split(/[_]+/)[0];

          // store yAxis options in separate variable
          const yAxisOptions = seriesData.yAxis;
          delete seriesData.yAxis;

          // insert object into Charts if not yet exists and create new chart
          if (!Charts.findOne({
              _id: measurement
            }, {
              reactive: false
            })) {
            Charts.insert({
              _id: measurement,
            });

            const seriesOptions = [];
            seriesOptions.push(seriesData);
            createChart(`container-chart-${measurement}`, measurement, seriesOptions, yAxisOptions);
          } else {
            // add series to existing chart
            const index = $(`#container-chart-${measurement}`).data('highchartsChart');
            const chart = Highcharts.charts[index];
            chart.addSeries(seriesData);
          }
        }
      },
    });
    initializing = false;
  }); // end autorun
}); // end of onRendered

Template.composite.helpers({
  selectedDate() {
    return moment.unix(endEpoch.get()).format('YYYY-MM-DD');
  },
  charts() {
    return Charts.find(); // This gives data to the html below
  },
});

Template.composite.events({
  'change #datepicker' (event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
    endEpoch.set(moment.unix(startEpoch.get()).add(1439, 'minutes').unix());
  },
});
