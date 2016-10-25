import Highcharts from 'highcharts/highstock';

// 3 days
const startEpoch = new ReactiveVar(moment().subtract(4320, 'minutes').unix());
var selectedFlag = new ReactiveVar(null);
var note = new ReactiveVar(null);

Meteor.subscribe('liveSites');

Highcharts.setOptions({
  global: {
    useUTC: false
  },
  colors: [
    '#058DC7',
    '#50B432',
    '#ED561B',
    '#DDDF00',
    '#24CBE5',
    '#64E572',
    '#FF9655',
    '#FFF263',
    '#6AF9C4'
  ]
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

  _.each(e.points, function(point) {
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
      EditPoints.insert(selectedPoint);
    }
  });

  // Show the Edit Points modal
  //$('#editPointsModal').modal({}).modal('show');
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
  const mychart = new Highcharts.StockChart({
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
        s += '<br/>' + this.series.name + ' <b>' + this.y.toFixed(2) + '</b>';
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

Template.site.onRendered(function() {
  // use query parameter if enetering site through different route
  const controller = Iron.controller();
  startEpoch.set(controller.state.get('fromRouter'));

  // load based on date selection
  this.autorun(function() {
    // Subscribe
    Meteor.subscribe('dataSeries', Router.current().params._id, startEpoch.get(), moment.unix(startEpoch.get()).add(4320, 'minutes').unix());
    Charts.remove({});

    let initializing = true;

    DataSeries.find().observeChanges({
      added: function(series, seriesData) {
        if (!initializing) { // true only when we first start
          const subType = series.split(/[_]+/)[0];
          const metric = series.split(/[_]+/)[1];

          // store yAxis options in separate variable
          const yAxisOptions = seriesData.yAxis;
					yAxisOptions.startOnTick= false;
            yAxisOptions.endOnTick = false;
          delete seriesData.yAxis;

          // insert object into Charts if not yet exists and create new chart
					const cretaID = `${subType}${metric}`;
					console.log(`added ${cretaID}`);
          if (!Charts.findOne({
            _id: cretaID
          }, {reactive: false})) {

             Charts.insert({
              _id: cretaID,
              // yAxis: [{
              //     metric
              //   }]
            });

            const seriesOptions = [];
            seriesOptions.push(seriesData);
          //  yAxisOptions.id = metric;
            createChart(`container-chart-${cretaID}`, cretaID, seriesOptions, yAxisOptions);

          } else {
          //   // put axis for each series
             const chart = $(`#container-chart-${cretaID}`).highcharts();
					//
          //   // Add another axis if not yet existent
          //   let axisExist = false;
					//
          //   Charts.findOne({_id: subType}).yAxis.forEach(function(axis) {
          //     if (axis.metric === metric) {
          //       axisExist = true;
          //     }
          //   });
					//
          //   if (!axisExist) {
          //     yAxisOptions.opposite = true;
          //     yAxisOptions.id = metric;
          //     chart.addAxis(yAxisOptions);
          //     Charts.update(subType, {
          //       $push: {
          //         yAxis: {
          //           metric
          //         }
          //       }
          //     });
          //   }
					//
          //   // Now just find the right axis index and assign it to the seriesData
          //   let axisIndex = 0;
          //   Charts.findOne({_id: subType}).yAxis.forEach(function(axis, i) {
          //     if (axis.metric === metric) {
          //       if (i === 0) { // navigator axis will be at index 1
          //         axisIndex = 0;
          //       } else {
          //         axisIndex = i + 1;
          //       }
          //     }
          //   });
          //   seriesData.yAxis = axisIndex;
             chart.addSeries(seriesData);
           }
        }
      }
    });
    initializing = false;
  }); // end autorun
  Router.current().params.query.startEpoch = undefined;
}); // end of onRendered

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

    Meteor.call('pushEdits', Router.current().params._id, listPushPoints, function(error, data) {

      if (error) {
        sAlert.error(error);
      }
      if (data) {
        sAlert.success('Push successful!');
      }
    });
  },
  // Handle the note filed change event (update note)
  'change .js-editNote'(event) {
    // Get value from editNote element
    const text = event.currentTarget.value;
    note.set(text);
  },
  // Handle the button "Change Flag" event
  'click .js-change'(event) {
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
    var validFlagSet = _.pluck(_.where(flagsHash, {selectable: true}), 'val');
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
  'change #datepicker'(event) {
		// update reactive var whith selected date
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'click #downloadCurrent'() {
    // call export and download
    DataExporter.getDataTCEQ(Router.current().params._id, startEpoch.get(), moment.unix(startEpoch.get()).add(4320, 'minutes').unix());
  }
});

/**
 * Highcharts plugin for manually scaling Y-Axis range.
 *
 * Author: Roland Banguiran
 * Email: banguiran@gmail.com
 *
 * Usage: Set scalable:false in the yAxis options to disable.
 * Default: true
 */

// JSLint options:
/*global Highcharts, document */

(function (H) {
    'use strict';
    var addEvent = H.addEvent,
        each = H.each,
        doc = document,
        body = doc.body;

    H.wrap(H.Chart.prototype, 'init', function (proceed) {

        // Run the original proceed method
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        var chart = this,
            renderer = chart.renderer,
            yAxis = chart.yAxis;

        each(yAxis, function (yAxis) {
            var options = yAxis.options,
                scalable = options.scalable === undefined ? true : options.scalable,
                labels = options.labels,
                pointer = chart.pointer,
                labelGroupBBox,
                bBoxX,
                bBoxY,
                bBoxWidth,
                bBoxHeight,
                isDragging = false,
                downYValue;

            if (scalable) {
                bBoxWidth = 40;
                bBoxHeight = chart.containerHeight - yAxis.top - yAxis.bottom;
                bBoxX = yAxis.opposite ? (labels.align === 'left' ? chart.containerWidth - yAxis.right : chart.containerWidth - (yAxis.right + bBoxWidth)) : (labels.align === 'left' ? yAxis.left : yAxis.left - bBoxWidth);
                bBoxY = yAxis.top;

                // Render an invisible bounding box around the y-axis label group
                // This is where we add mousedown event to start dragging
                labelGroupBBox = renderer.rect(bBoxX, bBoxY, bBoxWidth, bBoxHeight)
                    .attr({
                        fill: '#fff',
                        opacity: 0,
                        zIndex: 8
                    })
                    .css({
                        cursor: 'ns-resize'
                    })
                    .add();

                labels.style.cursor = 'ns-resize';

                addEvent(labelGroupBBox.element, 'mousedown', function (e) {
                    var downYPixels = pointer.normalize(e).chartY;

                    downYValue = yAxis.toValue(downYPixels);
                    isDragging = true;
                });

                addEvent(chart.container, 'mousemove', function (e) {
                    if (isDragging) {
                        body.style.cursor = 'ns-resize';

                        var dragYPixels = chart.pointer.normalize(e).chartY,
                            dragYValue = yAxis.toValue(dragYPixels),

                            extremes = yAxis.getExtremes(),
                            userMin = extremes.userMin,
                            userMax = extremes.userMax,
                            dataMin = extremes.dataMin,
                            dataMax = extremes.dataMax,

                            min = userMin !== undefined ? userMin : dataMin,
                            max = userMax !== undefined ? userMax : dataMax,

                            newMin,
                            newMax;

                        // update max extreme only if dragged from upper portion
                        // update min extreme only if dragged from lower portion
                        if (downYValue > (dataMin + dataMax) / 2) {
                            newMin = min;
                            newMax = max - (dragYValue - downYValue);
                            newMax = newMax > dataMax ? newMax : dataMax; //limit
                        } else {
                            newMin = min - (dragYValue - downYValue);
                            newMin = newMin < dataMin ? newMin : dataMin; //limit
                            newMax = max;
                        }

                        yAxis.setExtremes(newMin, newMax, true, false);
                    }
                });

                addEvent(document, 'mouseup', function () {
                    body.style.cursor = 'default';
                    isDragging = false;
                });

                // double-click to go back to default range
                addEvent(labelGroupBBox.element, 'dblclick', function () {
                    var extremes = yAxis.getExtremes(),
                        dataMin = extremes.dataMin,
                        dataMax = extremes.dataMax;

                    yAxis.setExtremes(dataMin, dataMax, true, false);
                });
            }
        });
    });
}(Highcharts));
