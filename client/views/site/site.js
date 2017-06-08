// JSLint options:
/* global Highcharts, document */
import Highcharts from 'highcharts/highstock';

// 3 days
const startEpoch = new ReactiveVar(moment().subtract(4320, 'minutes').unix());
const selectedFlag = new ReactiveVar(null);
var note = new ReactiveVar(null);

Meteor.subscribe('liveSites');

Highcharts.setOptions({
  global: {
    useUTC: false
  },
  colors: ['#DDDF00', '#4F525C', '#24CBE5', '#64E572', '#FF9655']
});

// placeholder for EditPoints in modal
const EditPoints = new Mongo.Collection(null);

// placeholder for dynamic chart containers
const Charts = new Meteor.Collection(null);

/**
 * Custom selection handler that selects points and cancels the default zoom behaviour
 */
function selectPointsByDrag(e) {
  // Select points only for series where allowPointSelect
  Highcharts.each(this.series, function(series) {
    if (series.options.allowPointSelect === 'true' && series.name !== 'Navigator') {

      Highcharts.each(series.points, function(point) {
        if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max) {
          point.select(true, true);
        }
      });
    }
  });

  // Fire a custom event
  Highcharts.fireEvent(this, 'selectedpoints', {points: this.getSelectedPoints()});

  return false; // Don't zoom
}

/**
 * The handler for the point selection, fired from selection event
 */
function selectedPoints(e) {
  // reset variables
  EditPoints.remove({});
  selectedFlag.set(null);
  note.set(null);

  _.each(e.points, function(point) {
    if (point.series.name !== 'Navigator') {
      const selectedPoint = {};
      selectedPoint.x = point.x;
      selectedPoint.y = point.y;
      selectedPoint.flag = flagsHash[point.name];
      selectedPoint.site = Router.current().params._id;
      selectedPoint.instrument = point.series.chart.title.textStr.split(/(\s+)/)[0];
      selectedPoint.measurement = point.series.name.split(/[_]+/)[0];
      selectedPoint.id = `${point.series.chart.title.textStr}_${point.series.name.split(/[_]+/)[0]}_${point.x}`;
      point.id = selectedPoint.id;
      EditPoints.insert(selectedPoint);
    }
  });

  // Show the Edit Points modal
  Modal.show("editPoints");

  $('#editPointsModal table tr .fa').click(function(event) {
    // Get X value stored in the data-id attribute of the button
    const pointId = $(event.currentTarget).data('id');

    // Query the local selected points db for that point, and remove it
    // This triggers a reactive render of the EditPoints
    EditPoints.remove({id: pointId});

    // Also remove the point from the HighCharts selection
    // (so it doesn't change color temporarily on approval)
    for (let i = 0; i < e.points.length; i++) {
      const p = e.points[i];
      if (p.id === pointId) {
        p.select(false, true);
        break;
      }
    }
  });
}

/**
 * On click, unselect all points & update with selected flag
 */
function unselectByClick() {
  const points = this.getSelectedPoints();

  if (points.length > 0) {
    Highcharts.each(points, function(point) {
      if (selectedFlag.get() !== null) {
        point.update({
          color: flagsHash[selectedFlag.get()].color,
          name: flagsHash[selectedFlag.get()].val
        }, true);
      }
      point.select(false);
    });
  }
}

/**
 * Create highstock based chart.
 */
function createChart(chartName, titleText, seriesOptions, yAxisOptions) {
  return new Highcharts.StockChart({
    exporting: {
      enabled: true
    },
    chart: {
      events: {
        selection: selectPointsByDrag,
        selectedpoints: selectedPoints,
        click: unselectByClick
      },
      zoomType: 'xy',
      renderTo: chartName,
      marginLeft: 100, // Keep all charts left aligned
      spacingTop: 20,
      spacingBottom: 20
    },
    title: {
      text: titleText
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Local Time'
      },
      ordinal: false,
      minRange: 3600
    },
    navigator: {
      xAxis: {
        dateTimeLabelFormats: {
          hour: '%e. %b'
        }
      }
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
      enabled: true,
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

Template.site.onCreated(function() {
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
    mySub = Meteor.subscribe('dataSeries', Router.current().params._id, startEpoch.get(), moment.unix(startEpoch.get()).add(4320, 'minutes').unix());

    Charts.remove({});

    DataSeries.find().observeChanges({
      added: function (series, seriesData) {
        if (!initializing) { // true only when we first start
          const subType = series.split(/[_]+/)[0];
          const metric = series.split(/[_]+/)[1];

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
            const chart = createChart(`container-chart-${chartId}`, `${subType} ${metric}`, seriesOptions, yAxisOptions);

            // Set text value for min/max form element
            const yAxis = chart.get(metric);
            const extremes = yAxis.getExtremes();

            Charts.update({
              _id: chartId
            }, {
              min: Math.floor(extremes.min),
              max: Math.floor(extremes.max)
            });

            // add another static legend to show flag colors
            chart.renderer.circle(chart.legend.group.translateX + 13, chart.legend.group.translateY - 50, 2).attr({ fill: 'red' }).add();
            chart.renderer.text('<text style="color:#333333;font-size:12px;font-weight:bold;fill:#333333;">Valid (K)</text>',
                 chart.legend.group.translateX + 25, chart.legend.group.translateY - 47).add();
            chart.renderer.circle(chart.legend.group.translateX + 13, chart.legend.group.translateY - 38, 2).attr({ fill: 'orange' }).add();
            chart.renderer.text('<text style="color:#333333;font-size:12px;font-weight:bold;fill:#333333;">Span (Q)</text>',
                 chart.legend.group.translateX + 25, chart.legend.group.translateY - 35).add();
            chart.renderer.circle(chart.legend.group.translateX + 13, chart.legend.group.translateY - 26, 2).attr({ fill: 'black' }).add();
            chart.renderer.text('<text style="color:#333333;font-size:12px;font-weight:bold;fill:#333333;">Offline (N)</text>',
                 chart.legend.group.translateX + 25, chart.legend.group.translateY - 23).add();
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

Template.editPoints.events({
  'click .dropdown-menu li a'(event) {
    event.preventDefault();
    selectedFlag.set(parseInt($(event.currentTarget).attr('data-value'), 10));
  },
  'click button#btnCancel'(event) {
    event.preventDefault();
    selectedFlag.set(null);
  },
  // Handle the button "Push" event
  'click button#btnPush'(event) {
    event.preventDefault();
    // Push Edited points in TCEQ format
    const pushPoints = EditPoints.find({});

    const listPushPoints = [];
    pushPoints.forEach(function(point) {
      listPushPoints.push(point.x / 1000);
    });

    Meteor.call('pushEdits', Router.current().params._id, listPushPoints, (error, result) => {
      if (error) {
        sAlert.error('Error during push.', error);
      }
      if (result) {
        sAlert.success(`Pushed file ${result} successful!`);
      }
    });
  },
  // Handle the note filed change event (update note)
  'change .js-editNote' (event) {
    // Get value from editNote element
    const text = event.currentTarget.value;
    note.set(text);
  },
  // Handle the button "Change Flag" event
  'click .js-change' (event) {
    event.preventDefault();

    const updatedPoints = EditPoints.find({}).fetch();

    // add edit to the edit collection
    Meteor.call('insertEdits', updatedPoints, flagsHash[selectedFlag.get()].val, note.get());

    // update the edited points with the selected flag and note on the server
    updatedPoints.forEach(function(point) {
      Meteor.call('insertUpdateFlag', point.site, point.x, point.instrument, point.measurement, flagsHash[selectedFlag.get()].val, note.get());
    });

    // Clear note field
    $('#editNote').val('');
  }
});

Template.editPoints.helpers({
  points() {
    return EditPoints.find({}, {
      // sort: {
      //   'x': -1,
      // },
    });
  },
  availableFlags() {
    return _.where(flagsHash, {selectable: true});
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
        $not: newFlag
      }
    }).count();
  },
  numPointsSelected() {
    return EditPoints.find().count();
  },
  formatDataValue(val) {
    return val.toFixed(3);
  },
  isValid() {
    const validFlagSet = _.pluck(_.where(flagsHash, {selectable: true}), 'val');
    return _.contains(validFlagSet, selectedFlag.get());
  }
});

Template.registerHelper('formatDate', function(epoch) {
  // convert epoch (long) format to readable
  return moment(epoch).format('YYYY/MM/DD HH:mm:ss');
});

Template.site.helpers({
  sitename() {
    const site = LiveSites.findOne({AQSID: Router.current().params._id});
    return site && site.siteName;
  },
  selectedDate() {
    return moment.unix(startEpoch.get()).format('YYYY-MM-DD');
  },
  charts() {
    return Charts.find(); // This gives data to the html below
  }
});

Template.site.events({
  // set y-axis min/max from form
  'submit .adjust' (event) {
    // Prevent default browser form submit
    event.preventDefault();
    // find axis of graph
    const target = event.target;
    const index = $(`#container-chart-${target.id}`).data('highchartsChart');
    const chart = Highcharts.charts[index];
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
    DataExporter.getDataTCEQ(Router.current().params._id, startEpoch.get(), moment.unix(startEpoch.get()).add(4320, 'minutes').unix(), false);
  }
});
