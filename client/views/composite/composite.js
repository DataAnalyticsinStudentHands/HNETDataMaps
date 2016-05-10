import Highcharts from 'highcharts/highstock';

// 24 hours ago - seconds
var startEpoch = new ReactiveVar(moment().subtract(1439, 'minutes').unix());
var endEpoch = new ReactiveVar(moment().unix());

Highcharts.setOptions({
  global: {
    useUTC: false,
  },
  colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
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

    DataSeries.find().observeChanges({
      added: function (series, seriesData) {
        if (!initializing) { // true only when we first start
          const subType = series.split(/[_]+/)[0];
          const metric = series.split(/[_]+/)[1];

          // store yAxis options in separate variable
          const yAxisOptions = seriesData.yAxis;
          delete seriesData.yAxis;

          // insert object into Charts if not yet exists and create new chart
          if (!Charts.findOne({
              _id: subType
            }, {
              reactive: false
            })) {
            Charts.insert({
              _id: subType,
              yAxis: [{
                metric
              }],
            });

            const seriesOptions = [];
            seriesOptions.push(seriesData);
            yAxisOptions.id = metric;
          //  createChart(`container-chart-${subType}`, subType, seriesOptions, yAxisOptions);
          } else {
            // put axis for each series
            const chart = $(`#container-chart-${subType}`).highcharts();

            // Add another axis if not yet existent
            let axis_exist = false;

            Charts.findOne({
              _id: subType
            }).yAxis.forEach(function (axis) {
              if (axis.metric === metric) {
                axis_exist = true;
              }
            })

            if (!axis_exist) {
              yAxisOptions.opposite = true;
              yAxisOptions.id = metric;
              chart.addAxis(
                yAxisOptions
              );
              Charts.update(subType, {
                $push: {
                  yAxis: {
                    metric
                  },
                },
              });
            }

            // Now just find the right axis index and assign it to the seriesData
            let axis_index = 0;
            Charts.findOne({
              _id: subType
            }).yAxis.forEach(function (axis, i) {
              if (axis.metric === metric) {
                if (i === 0) { // navigator axis will be at index 1
                  axis_index = 0;
                } else {
                  axis_index = i + 1;
                }
              }
            });
            seriesData.yAxis = axis_index;

          //  chart.addSeries(seriesData);
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
