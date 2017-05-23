// JSLint options:
/* global Highcharts, document */
import Highcharts from 'highcharts';

// 1 day
const startEpoch = new ReactiveVar(moment().subtract(1440, 'minutes').unix());

Highcharts.setOptions({
  global: {
    useUTC: false
  },
  colors: ['#DDDF00', '#4F525C', '#24CBE5', '#64E572', '#FF9655']
});

// local collection for dynamic chart containers
const Charts = new Meteor.Collection(null);



/**
 * Create highstock based chart.
 */
function createChart(chartName, seriesOptions, yAxisOptions) {
  return new Highcharts.chart({
    exporting: {
      enabled: true
    },
    chart: {
      zoomType: 'xy',
      renderTo: chartName,
      marginLeft: 100, // Keep all charts left aligned
      spacingBottom: 20
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
        return {x: tooltipX, y: tooltipY};
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
      enabled: false,
      align: 'right',
      layout: 'vertical',
      verticalAlign: 'top',
      y: 200
    },
    rangeSelector: {
      inputEnabled: false,
      allButtonsEnabled: true,
      buttons: [
        {
          type: 'day',
          count: 1,
          text: '1 Day'
        }, {
          type: 'day',
          count: 3,
          text: '3 Days'
        }, {
          type: 'minute',
          count: 60,
          text: 'Hour'
        }
      ],
      buttonTheme: {
        width: 60
      },
      selected: 1
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
          let channelHeader = 'dfd';
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

						console.log(`${JSON.stringify(Router.current().data().currentData)}`)
						console.log(Router.current().data().currentData.epoch)

            const seriesOptions = [];
            seriesOptions.push(seriesData);
            yAxisOptions.id = metric;
            const chart = createChart(`container-chart-${chartId}`, seriesOptions, yAxisOptions);

            // Set text value for min/max form element
            const yAxis = chart.get(metric);
            const extremes = yAxis.getExtremes();

            Charts.update({
              _id: chartId
            }, {
              min: Math.floor(extremes.min),
              max: Math.floor(extremes.max),
              _channelHeader: channelHeader
            });
          } else {
            // add other series that belongs to this chart
            const chart = $(`#container-chart-${chartId}`).highcharts();
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
  // set y-axis min/max from form
  'submit .adjust' (event) {

    // Prevent default browser form submit
    event.preventDefault();
    // find axis of graph
    const target = event.target;
    const chart = $(`#container-chart-${target.id}`).highcharts();
    const metric = chart.title.textStr.split(/[ ]+/)[1]; // measurement
    const yAxis = chart.get(metric);
    // Set value from form element
    yAxis.setExtremes(target.min.value, target.max.value);
  },
  'change #datepicker' (event) {
    // update reactive var whith selected date
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'click #downloadCurrent' () {
    // call export and download
    DataExporter.getDataTCEQ(Router.current().params._id, startEpoch.get(), moment.unix(startEpoch.get()).add(1440, 'minutes').unix(), false);
  }
});
