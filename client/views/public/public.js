// JSLint options:
/* global Highcharts, document */
import Highcharts from 'highcharts';
// Load additional modules after Highcharts is loaded
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);
require('highcharts/modules/data.js')(Highcharts);

// 1 day
const startEpoch = new ReactiveVar(moment().subtract(1440, 'minutes').unix());

Highcharts.setOptions({
  global: {
    useUTC: false
  },
  colors: ['#FF9655']
});

// local collection for dynamic chart containers
const Charts = new Meteor.Collection(null);

// hash for chart type gauge/bar depending on channel
const chartsHash = {
  WS: 'gauge',
  Temp: 'bar',
  WD: 'rose'
};

// Create highcharts based wind rose
function createRose(container, current) {
  return new Highcharts.chart({
    exporting: { enabled: false },
    chart: {
      renderTo: container,
      type: 'gauge',
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false,
      height: 220
    },
    title: {
      text: null
    },
    pane: {
      startAngle: 0,
      endAngle: 360
    },
    tooltip: {
      enabled: false
    },
    // the value axis
    yAxis: {
      min: 0,
      max: 360,
      tickWidth: 1,
      tickPosition: 'outside',
      tickLength: 20,
      tickColor: '#999',
      tickInterval: 45,
      labels: {
        rotation: 'auto',
        formatter: function() {
          if (this.value === 360) {
            return 'N';
          } else if (this.value === 45) {
            return 'NE';
          } else if (this.value === 90) {
            return 'E';
          } else if (this.value === 135) {
            return 'SE';
          } else if (this.value === 180) {
            return 'S';
          } else if (this.value === 225) {
            return 'SW';
          } else if (this.value === 270) {
            return 'W';
          } else if (this.value === 315) {
            return 'NW';
          }
          return 0;
        }
      }
    },
    credits: {
      enabled: false
    },
    series: [{
      data: [current],
      dataLabels: {
        format: '<span style="font-size:20px;color:' +
        ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}' + '°</span>',
        borderWidth: 0,
        y: 120
      }
    }]
  });
}

// Create highcharts based gauge
function createGauge(container, current) {
  return new Highcharts.chart({
    exporting: { enabled: false },
    chart: {
      type: 'solidgauge',
      renderTo: container,
      height: 220
    },
    title: null,
    pane: {
      center: ['50%', '85%'],
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
        innerRadius: '30%',
        outerRadius: '100%',
        shape: 'arc'
      }
    },
    tooltip: {
      enabled: false
    },
    // the value axis
    yAxis: {
      stops: [
        [0.1, '#55BF3B'], // green
        [0.5, '#DDDF0D'], // yellow
        [0.9, '#DF5353'] // red
      ],
      labels: {
        y: 0
      },
      min: 0,
      max: 50
    },

    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 40,
          borderWidth: 0,
          useHTML: true
        }
      }
    },
    credits: {
      enabled: false
    },
    series: [{
      data: [current],
      dataLabels: {
        format: '<div style="text-align:center"><span style="font-size:20px;color:' +
        ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span>' +
        '<span style="font-size:12px;color:silver"> m/s</span></div>'
      }
    }]
  });
}

// Create highcharts based bar chart.
function createBar(chartName, current, unit) {
  return new Highcharts.chart({
    chart: {
      type: 'column',
      renderTo: chartName,
      height: 300
    },
    exporting: {
      enabled: false
    },
    tooltip: {
      enabled: false
    },
    title: {
      text: null // disbale chart title
    },
    yAxis: {
      min: 0,
      title: null
    },
    credits: {
      enabled: false
    },
    series: [{
      data: [current],
      name: `<div style="text-align:center"><span style="font-size:20px;">${current}</span><span style="font-size:12px;color:silver"> ${unit}</span></div>`
    }],
    legend: {
      symbolHeight: 0,
      symbolWidth: 0,
      symbolRadius: 0
    }
  });
}

// Create highstock based chart.
function createChart(chartName, seriesOptions, yAxisOptions) {
  return new Highcharts.chart({
    chart: {
      zoomType: 'xy',
      renderTo: chartName,
      marginLeft: 100, // Keep all charts left aligned
    },
    title: {
      text: null // disbale chart title
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Local Time'
      },
      ordinal: false,
      minRange: 3600
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
        return { x: tooltipX, y: tooltipY };
      },
      formatter() {
        let s = moment(this.x).format('YYYY/MM/DD HH:mm:ss');
        s += '<br/>' + this.series.name + ' <b>' + this.y.toFixed(2) + '</b>' + '<br/>' + this.x;
        return s;
      },
      shared: false
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    }
  });
}

Template.public.onCreated(function() {
  // use query parameter if enetering site through different route
  const controller = Iron.controller();
  startEpoch.set(controller.state.get('fromRouter'));

  let mySub;

  // load based on date selection
  this.autorun(function() {
    // take care of over-subscription
    let initializing = true;
    if (mySub !== undefined) {
      mySub.stop();
    }

    // Subscribe
    mySub = Meteor.subscribe('publicDataSeries', Router.current().params._id, startEpoch.get(), moment.unix(startEpoch.get()).add(1440, 'minutes').unix());

    Charts.remove({});

    PublicDataSeries.find().observeChanges({
      added: function (series, seriesData) {

        if (!initializing) { // true only when we first start
          const subType = series.split(/[_]+/)[0];
          const metric = series.split(/[_]+/)[1];

          // load some data from site channels object
          let channelHeader = '';
          _.each(Router.current().data().site.Channels, (channel) => {
            if (channel.Name === metric) {
              channelHeader = channel.Header;
            }
          });

          let chartId = '';
          // HNET channels for NOx instrument should be shown in one graph
          if (subType === 'NOx') {
            chartId = `${subType}`;
          } else {
            chartId = `${subType}_${metric}`;
          }

          // store yAxis options in separate variable
          const yAxisOptions = seriesData.yAxis;
          yAxisOptions.startOnTick = false;
          yAxisOptions.endOnTick = false;
          delete seriesData.yAxis;

          // insert object into Charts if not yet exists and create new chart
          if (!Charts.findOne({
            _id: chartId
          }, { reactive: false })) {
            Charts.insert({
              _id: chartId
            });

            const seriesOptions = [];
            seriesOptions.push(seriesData);
            yAxisOptions.id = metric;
            createChart(`container-chart-${chartId}`, seriesOptions, yAxisOptions);

            // add header
            Charts.update({
              _id: chartId
            }, {
              _channelHeader: channelHeader
            });

            // create current data bar and gauge charts
            let current = Router.current().data().currentData.subTypes[subType][metric][1].val;
            current = Math.round(current);
            // current = Math.round(current * 100) / 100;
            const unit = Router.current().data().currentData.subTypes[subType][metric][3].val;

            if (chartsHash[metric] === 'gauge') {
              createGauge(`container-current-${chartId}`, current, unit);
            } else if (chartsHash[metric] === 'rose') {
              createRose(`container-current-${chartId}`, current, unit);
            } else {
              createBar(`container-current-${chartId}`, current, unit);
            }
          } else {
            // add other series that belongs to this chart
            const index = $(`#container-chart-${chartId}`).data('highchartsChart');
            const chart = Highcharts.charts[index];
            chart.addSeries(seriesData);
          }
        }
      }
    });
    initializing = false;
  }); // end autorun
  Router.current().params.query.startEpoch = undefined;
}); // end of onCreated

Template.registerHelper('formatDate', function(epoch) {
  // convert epoch (long) format to readable
  return moment(epoch).format('YYYY/MM/DD HH:mm:ss');
});

Template.public.helpers({
  selectedDate() {
    return moment.unix(startEpoch.get()).format('YYYY-MM-DD');
  },
  charts() {
    return Charts.find(); // This gives data to the html below
  }
});

Template.public.events({
  'change #datepicker'(event) {
    // update reactive var whith selected date
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  }
});
