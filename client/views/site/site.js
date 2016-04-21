// 24 hours ago - seconds
var startEpoch = new ReactiveVar(moment().subtract(1439, 'minutes').unix());
var endEpoch = new ReactiveVar(moment().unix());
var selectedFlag = new ReactiveVar(null);

Meteor.subscribe('sites');



Highcharts.setOptions({
  global: {
    useUTC: false,
  },
});

// pass null as collection name, it will create
// local only collection
var EditPoints = new Mongo.Collection(null);

const unitsHash = {
  O3: 'pbbv',
  NO: 'pbbv',
  NO2: 'pbbv',
  NOx: 'pbbv',
  WS: 'miles/hour',
  WD: 'degree',
  Temp: 'degree C',
  RH: 'percent',
  MassConc: 'ugm3',
  AmbTemp: 'C',
};

// placeholder for dynamic chart containers
var Charts = new Meteor.Collection(null);

/**
 * Custom selection handler that selects points and cancels the default zoom behaviour
 */
function selectPointsByDrag(e) {
  var selection = [];
  // Select points only for series where allowPointSelect
  Highcharts.each(this.series, function(series) {
    if (series.options.allowPointSelect === 'true') {
      Highcharts.each(series.points, function(point) {
        // Uncomment to always select new points instead of adding points to selection
        // point.select(false)
        if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max) {
          // point.select(true, true);
          selection.push(point);
        }
      });
    }
  });

  // Fire a custom event
  HighchartsAdapter.fireEvent(this, 'selectedpoints', {
    // points: this.getSelectedPoints()
    points: selection
  });

  return false; // Don't zoom
}

/**
 * The handler for a custom event, fired from selection event
 */
function selectedPoints(e) {
  var points = [];
  _.each(e.points, function(point) {
    if (point.series.type === 'scatter') {
      const selectedPoint = {};
      selectedPoint.x = point.x;
      selectedPoint.y = point.y;
      selectedPoint.flag = flagsHash[point.name];
      selectedPoint.site = Router.current().params._id;
      selectedPoint.instrument = point.series.chart.title.textStr;
      selectedPoint.measurement = point.series.name;
      selectedPoint.id = point.series.chart.title.textStr + '_' + point.series.name + '_' + point.x;
      point.id = selectedPoint.id;
      points.push(selectedPoint);
    }
  });

  if (points.length === 0) return;

  EditPoints.remove({});
  for (let i = 0; i < points.length; i++) {
    EditPoints.insert(points[i]);
  }

  $('#editPointsModal').modal({}).modal('show');

  $('#btnSubmit').click(function(event) {
    // update the edited points with the selected flag on the server
    const newFlagVal = flagsHash[selectedFlag.get()].val;
    const updatedPoints = EditPoints.find({});
    updatedPoints.forEach(function(point) {
      Meteor.call('insertUpdateFlag', point.site, point.x, point.instrument, point.measurement, newFlagVal);
    });
    // Update local point color to reflect new flag
    e.points.forEach((point) => {
      point.update({
        color: flagsHash[selectedFlag.get()].color,
      }, false);
    });
    // Redraw chart

    e.points[0].series.chart.redraw();
  });

  $('#editPointsModal table tr .fa').click(function(event) {
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
  const points = this.getSelectedPoints();
  if (points.length > 0) {
    Highcharts.each(points, function(point) {
      point.select(false);
    });
  }
}

// checking autorun
let autoCounter = 1;

function createChart(chartName, subType, yAxis, seriesOptions) {
	$('#' + chartName).highcharts('StockChart', {
		exporting: {
			enabled: true,
		},
		chart: {
			events: {
				selection: selectPointsByDrag,
				selectedpoints: selectedPoints,
				click: unselectByClick,
			},
			zoomType: 'xy',
		},
		title: {
			text: subType,
		},
		xAxis: {
			type: 'datetime',
			title: {
				text: 'Local Time',
			},
		},
		yAxis: yAxis,
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
		rangeSelector: {
			inputEnabled: false,
			allButtonsEnabled: true,
			buttons: [{
				type: 'minute',
				count: 60,
				text: 'Hour',
				dataGrouping: {
					forced: true,
					units: [
						['hour', [60]],
					],
				},
			}, {
				type: 'day',
				count: 3,
				text: '3 Days',
				dataGrouping: {
					forced: true,
					units: [
						['day', [1]],
					],
				},
			}, {
				type: 'day',
				count: 1,
				text: '1 Day',
				dataGrouping: {
					forced: true,
					units: [
						['day', [1]],
					],
				},
			}],
			buttonTheme: {
				width: 60,
			},
			selected: 2,
		},
		legend: {
			enabled: true,
			align: 'right',
			layout: 'vertical',
			verticalAlign: 'top',
			y: 100,
		},
	}); // end of chart
}

Template.site.onRendered(function() {

  // Subscribe
  console.log('auto counter:', autoCounter);
  console.log('site: ', Router.current().params._id, 'start: ', startEpoch.get(), 'end: ', endEpoch.get());
  var subs = Meteor.subscribe('dataSeries', Router.current().params._id, startEpoch.get(), endEpoch.get());

  // Do reactive stuff when subscribe is ready
  this.autorun(function() {
    if (!subs.ready()) {
      return;
    }

		var cursor = Template.currentData(),
			initializing = true, // add initializing variable, see:  http://docs.meteor.com/#/full/meteor_publish
			liveChart,
  		query = DataSeries.find();

			var seriesOptions = {};

    _.each(query, function(data) {
      // Create data series for plotting
      if (!seriesOptions[data.subType]) {
        seriesOptions[data.subType] = [];
      }
      _.each(data.datapoints, function(datapoints, i) {
        if (data.chartType === 'line') {
          seriesOptions[data.subType].push({
            type: data.chartType,
            name: i + ' ' + data._id.split(/[_]+/).pop(),
            lineWidth: data.lineWidth,
            allowPointSelect: data.allowPointSelect,
            data: datapoints,
            zIndex: data.zIndex
          });
        } else {
          seriesOptions[data.subType].push({
            type: data.chartType,
            name: i + ' ' + data._id.split(/[_]+/).pop(),
            marker: {
              enabled: true,
              radius: 2
            },
            allowPointSelect: data.allowPointSelect,
            data: datapoints,
            zIndex: data.zIndex
          });
        }
      });
    });
  });



  // Create basic line-chart:
  liveChart = Highcharts.chart(cursor.chart_id, {
    title: {
      text: 'Number of elements'
    },
    series: [{
      type: 'column',
      name: 'Tasks',
      data: [query.count()]
    }]
  });

  // Add watchers:
  query.observeChanges({
    added: function() {
      if (!initializing) {
        // We will use Highcharts API to add point with "value = previous_value + 1" to indicate number of tasks
        var points = liveChart.series[0].points;
        liveChart.series[0].addPoint(
          points[points.length - 1].y + 1
        );
      }
    },
    removed: function() {
      if (!initializing) {
        // We will use Highcharts API to add point with "value = previous_value - 1" to indicate number of tasks
        var points = liveChart.series[0].points;
        liveChart.series[0].addPoint(
          points[points.length - 1].y - 1
        );
      }
    }
  });
  initializing = false;

  Tracker.autorun(function() {


    Charts.remove({});

    _.each(seriesOptions, function(series, id) {
      Charts.insert({
        id: id
      });
      const yAxis = [];
      if (id.indexOf('RMY') >= 0) { // special treatment for wind instruments
        yAxis.push({ // Primary yAxis
          labels: {
            format: '{value} ' + unitsHash[series[0].name.split(/[ ]+/)[0]],
            style: {
              color: Highcharts.getOptions().colors[0],
            },
          },
          title: {
            text: series[0].name.split(/[ ]+/)[0],
            style: {
              color: Highcharts.getOptions().colors[0],
            },
          },
          opposite: false,
          floor: 0,
          ceiling: 360,
          tickInterval: 90,
        });
        if (series.length > 2) {
          yAxis.push({ // Secondary yAxis
            title: {
              text: series[1].name.split(/[ ]+/)[0],
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            labels: {
              format: '{value} ' + unitsHash[series[1].name.split(/[ ]+/)[0]],
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            floor: 0,
            // NOTE: there are some misreads with the sensor, and so
            // it occasionally reports wind speeds upwards of 250mph.
            ceiling: 20,
            tickInterval: 5,
          });
          for (let i = 0; i < series.length; i++) {
            // put axis for each series
            series[i].yAxis = !(i & 1) ? 0 : 1;
          }
        }
      } else {
        yAxis.push({ // Primary yAxis
          labels: {
            format: '{value} ' + unitsHash[series[0].name.split(/[ ]+/)[0]],
            style: {
              color: Highcharts.getOptions().colors[0],
            },
          },
          title: {
            text: series[0].name.split(/[ ]+/)[0],
            style: {
              color: Highcharts.getOptions().colors[0],
            },
          },
          opposite: false,
          floor: 0,
        });
        if (series.length > 2) {
          yAxis.push({ // Secondary yAxis
            title: {
              text: series[1].name.split(/[ ]+/)[0],
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            labels: {
              format: '{value} ' + unitsHash[series[1].name.split(/[ ]+/)[0]],
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            floor: 0,
          });
          for (let i = 0; i < series.length; i++) {
            // put axis for each series
            series[i].yAxis = !(i & 1) ? 0 : 1;
          }
        }
      }
      createChart('container-chart-' + id, id, yAxis, series);
    });


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
    return EditPoints.find({});
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

Template.registerHelper('formatDate', function(epoch) {
  return moment(epoch).format('YYYY/MM/DD HH:mm:ss');
});

Template.site.helpers({
  sitename() {
    const site = Sites.findOne({
      AQSID: Router.current().params._id,
    });
    return site['site name'];
  },
  selectedDate() {
    return moment.unix(endEpoch.get()).format('YYYY-MM-DD');
  },
  charts() {
    return Charts.find(); // This gives data to the html below
  },
});

Template.editPoints.destroyed = function() {
  alert('window closed');
};

Template.site.events({
  'change #datepicker' (event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
    endEpoch.set(moment.unix(startEpoch.get()).add(1439, 'minutes').unix()); // always to current?
  },
  'click #createPush' () {
    DataExporter.exportForTCEQ(Router.current().params._id, startEpoch.get(), endEpoch.get());
  },
  'click #updateAggr' () {
    Meteor.call('new5minAggreg', Router.current().params._id, startEpoch.get(), endEpoch.get(), function(err, response) {
      if (err) {
        Session.set('serverDataResponse', 'Error:' + err.reason);
        return;
      }
      Session.set('serverDataResponse', response);
    });
  },
});
