import Highcharts from 'highcharts/highstock';

// 3 days
var startEpoch = new ReactiveVar(moment().subtract(4320, 'minutes').unix());
var endEpoch = new ReactiveVar(moment().unix());
var selectedFlag = new ReactiveVar(null);

Meteor.subscribe('sites');

Highcharts.setOptions({
  global: {
    useUTC: false,
  },
  colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
});

// placeholder for EditPoints in modal
const EditPoints = new Mongo.Collection(null);

// placeholder for dynamic chart containers
const Charts = new Meteor.Collection(null);

/**
 * Custom selection handler that selects points and cancels the default zoom behaviour
 */
function selectPointsByDrag(e) {
  var selection = [];
  // Select points only for series where allowPointSelect
  Highcharts.each(this.series, function (series) {
    if (series.options.allowPointSelect === 'true' && series.name !== 'Navigator') {
      Highcharts.each(series.points, function (point) {
        if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max) {
          // point.select(true, true);
          selection.push(point);
        }
      });
    }
  });

  // Fire a custom event
  Highcharts.fireEvent(this, 'selectedpoints', {
    // points: this.getSelectedPoints
    points: selection,
  });

  return false; // Don't zoom
}

/**
 * The handler for a custom event, fired from selection event
 */
function selectedPoints(e) {
  var points = [];
  const series = [];

  _.each(e.target.series, function (serie) {
    if (serie.name.endsWith('5m')) {
      series.push(serie);
    }
  });

  _.each(e.points, function (point) {
    if (point.series.name !== 'Navigator') {
      const selectedPoint = {};
      selectedPoint.x = point.x;
      selectedPoint.y = point.y;
      selectedPoint.flag = flagsHash[point.name];
      selectedPoint.site = Router.current().params._id;
      selectedPoint.instrument = point.series.chart.title.textStr;
      selectedPoint.measurement = point.series.name.split(/[_]+/)[0];
      selectedPoint.id = `${point.series.chart.title.textStr}_${point.series.name.split(/[_]+/)[0]}_${point.x}`;
      point.id = selectedPoint.id;
      points.push(selectedPoint);
    }
  });

  if (points.length === 0) return;

  // reset variables
  EditPoints.remove({});
  selectedFlag.set(null);

  for (let i = 0; i < points.length; i++) {
    EditPoints.insert(points[i]);
  }

  // Show the Edit Points modal
  $('#editPointsModal').modal({}).modal('show');

  // Handle the button "Push" event
  $('#btnPush').click(function (event) {
    event.preventDefault();
    alert(`Push functionality not activated!`);
  });

  // Handle the button "Change Flag" event
  $('#btnChange').click(function (event) {
    event.preventDefault();
    // update the edited points with the selected flag and note on the server
    const newFlagVal = flagsHash[selectedFlag.get()].val;
    const updatedPoints = EditPoints.find({});
    const note = $('#editNote').val();

    updatedPoints.forEach(function (point) {
      Meteor.call('insertUpdateFlag', point.site, point.x, point.instrument, point.measurement, newFlagVal, note);
    });

    // Clear note field
    $('#editNote').val('');

    // Update local point color to reflect new flag
    e.points.forEach((point) => {
      point.update({
        color: flagsHash[selectedFlag.get()].color,
      }, true);
    });
  });

  $('#editPointsModal table tr .fa').click(function (event) {
    // Get X value stored in the data-id attribute of the button
    const pointId = $(event.currentTarget).data('id');

    // Query the local selected points db for that point, and remove it
    // This triggers a reactive render of the EditPoints
    EditPoints.remove({
      id: pointId,
    });

    // Also remove the point from the HighCharts selection
    // (so it doesn't change color temporarily on approval)
    for (let i = 0; i < e.points.length; i++) {
      const p = e.points[i];
      if (p.id === pointId) {
        p.select(false);
        e.points.splice(i, 1);
        break;
      }
    }
  });
}

/**
 * On click, unselect all points
 */
function unselectByClick() {
  var points = this.getSelectedPoints();
  if (points.length > 0) {
    Highcharts.each(points, function (point) {
      point.select(false);
    });
  }
}

/**
 * Create highstock based chart.
 */
function createChart(chartName, titleText, seriesOptions, yAxisOptions) {
  const mychart = new Highcharts.StockChart({
    exporting: {
      enabled: true,
    },
    chart: {
      events: {
        selection: selectPointsByDrag,
        selectedpoints: selectedPoints,
        click: unselectByClick,
      },
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
        type: 'day',
        count: 3,
        text: '3 Days',
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

Template.site.onRendered(function () {
  // Do reactive stuff when something is added or removed
  this.autorun(function () {
    // Subscribe
    Meteor.subscribe('dataSeries', Router.current().params._id,
      startEpoch.get(), endEpoch.get());
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
            createChart(`container-chart-${subType}`, subType, seriesOptions, yAxisOptions);
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
            chart.addSeries(seriesData);
          }
        }
      },
    });
    initializing = false;
  }); // end autorun
}); // end of onRendered

Template.editPoints.events({
  'click .dropdown-menu li a' (event) {
    event.preventDefault();
    selectedFlag.set(parseInt($(event.currentTarget).attr('data-value'), 10));
  },
});

Template.editPoints.helpers({
  points() {
    return EditPoints.find({}, {
      sort: {
        'x': -1,
      },
    });
  },
  availableFlags() {
    return _.where(flagsHash, {
      selectable: true,
    });
  },
  flagSelected() {
    return flagsHash[selectedFlag.get()];
  },
  numFlagsWillChange() {
    const newFlag = selectedFlag.get();
    if (newFlag === null || isNaN(newFlag)) {
      return 0;
    }
    return EditPoints.find({
      'flag.val': {
        $not: newFlag,
      },
    }).count();
  },
  numPointsSelected() {
    return EditPoints.find().count();
  },
  formatDataValue(val) {
    return val.toFixed(3);
  },
  isValid() {
    var validFlagSet = _.pluck(_.where(flagsHash, {
      selectable: true,
    }), 'val');
    return _.contains(validFlagSet, selectedFlag.get());
  },
});

Template.registerHelper('formatDate', function (epoch) {
	// convert epoch (long) format to readable
  return moment(epoch).format('YYYY/MM/DD HH:mm:ss');
});

Template.site.helpers({
  sitename() {
    const site = Sites.findOne({
      AQSID: Router.current().params._id,
    });
    return site && site.siteName;
  },
  selectedDate() {
    return moment.unix(startEpoch.get()).add(2160, 'minutes').format('YYYY-MM-DD');
  },
  charts() {
    return Charts.find(); // This gives data to the html below
  },
});

Template.site.events({
  'change #datepicker' (event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
    endEpoch.set(moment.unix(startEpoch.get()).add(4320, 'minutes').unix());
  },
  'click #createPush' () {
    DataExporter.exportForTCEQ(Router.current().params._id, startEpoch.get(), endEpoch.get(), true);
  },
  'click #updateAggr' () {
    Meteor.call('new5minAggreg', Router.current().params._id,
      startEpoch.get(), endEpoch.get(),
      function (err, response) {
        if (err) {
          Session.set('serverDataResponse', `Error: ${err.reason}`);
          return;
        }
        Session.set('serverDataResponse', response);
      });
  },
});
