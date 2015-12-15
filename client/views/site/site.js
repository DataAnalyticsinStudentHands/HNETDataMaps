var startEpoch = new ReactiveVar(moment().subtract(1439, 'minutes').unix()); //24 hours ago - seconds
var endEpoch = new ReactiveVar(moment().unix());
var selectedFlag = new ReactiveVar(1);

Meteor.subscribe('sites');

Highcharts.setOptions({
    global: {
        useUTC: false
    }
});

//pass null as collection name, it will create
//local only collection
var EditPoints = new Mongo.Collection(null);

var flagsHash = {
    0: {
        val: 0,
        description: 'zero',
        label: 'Q',
        color: 'white'
    },
    1: {
        val: 1,
        description: 'valid',
        label: 'K',
        color: 'red'
    },
    2: {
        val: 2,
        description: 'span',
        label: 'Q',
        color: 'orange'
    },
    3: {
        val: 3,
        description: 'span',
        label: 'Q',
        color: 'orange'
    },
    4: {
        val: 4,
        description: 'span',
        label: 'Q',
        color: 'orange'
    },
    5: {
        val: 5,
        description: 'span',
        label: 'Q',
        color: 'orange'
    },
    8: {
        val: 8,
        description: 'maintenance',
        label: 'P',
        color: 'grey'
    },
    9: {
        val: 9,
        description: 'offline',
        label: 'N',
        color: 'black'
    }
};

var unitsHash = {
    conc: 'pbbv',
    Speed: 'miles/hour',
    Direction: 'degree',
    Temp: 'degree C',
    RH: 'percent'
};

//placeholder for dynamic chart containers
var Charts = new Meteor.Collection(null); //This will store our synths

/**
 * Custom selection handler that selects points and cancels the default zoom behaviour
 */
function selectPointsByDrag(e) {

    // Select points only for series where allowPointSelect
    Highcharts.each(this.series, function (series) {
        if (series.options.allowPointSelect === 'true') {
            Highcharts.each(series.points, function (point) {
                if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max &&
                    point.y >= e.yAxis[0].min && point.y <= e.yAxis[0].max) {
                    point.select(true, true);
                }
            });
        }
    });

    // Fire a custom event
    HighchartsAdapter.fireEvent(this, 'selectedpoints', {
        points: this.getSelectedPoints()
    });

    return false; // Don't zoom
}

/**
 * The handler for a custom event, fired from selection event
 */
function selectedPoints(e) {
    var points = [];

    _.each(e.points, function (point) {
        if (point.series.type === 'scatter') {
            var selectedPoint = {};
            selectedPoint.x = point.x;
            selectedPoint.y = point.y;
            selectedPoint.flag = flagsHash[point.name];
            selectedPoint.site = Router.current().params._id;
            selectedPoint.instrument = point.series.chart.title.textStr;
            selectedPoint.measurement = point.series.name;
            points.push(selectedPoint);
        }
    });

    EditPoints.remove({});
    for (var i = 0; i < points.length; i++) {
        EditPoints.insert(points[i]);
    }
    
    $('.ui.dropdown').dropdown('clear');

    $('#editPointsModal').modal({
        onDeny: function () {
            //do nothing
        },
        onApprove: function () {
            //update the edited points with the selected flag on the server
            var newFlagVal = flagsHash[selectedFlag.get()].val;
            var updatedPoints = EditPoints.find({});
            updatedPoints.forEach(function (point) {
                Meteor.call('insertUpdateFlag', point.site, point.x, point.instrument, point.measurement, newFlagVal);
            });                     
        }
    }).modal('show');
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

//checking autorun
var autoCounter = 1;

Template.site.onRendered(function () {
    Tracker.autorun(function () {
        //add notes to documents?
        //need to figure out better management of Tracker.autorun - it runs too often

        autoCounter += 1;
        console.log('auto counter:', autoCounter);
        console.log('site: ', Router.current().params._id, 'start: ', startEpoch.get(), 'end: ', endEpoch.get());
        Meteor.subscribe('dataSeries', Router.current().params._id, startEpoch.get(), endEpoch.get());
        Meteor.subscribe('aggregatedata5min');

        var seriesOptions = {};
        Charts.remove({});

        var allSeries = DataSeries.find({}).fetch();
        _.each(allSeries, function (data) {
            //console.log('data: ', data);
            //Create data series for plotting
            if (!seriesOptions[data.subType]) {
                seriesOptions[data.subType] = [];
            }
            //console.log('data: ', data);
            _.each(data.datapoints, function (datapoints, i) {
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

        _.each(seriesOptions, function (series, id) {
            Charts.insert({
                id: id
            });
            var yAxis = [{ // Primary yAxis
                labels: {
                    format: '{value} ' + unitsHash[series[0].name.split(/[ ]+/)[0]],
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                title: {
                    text: series[0].name.split(/[ ]+/)[0],
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }
            }];

            if (series.length > 2) {
                yAxis.push({ // Secondary yAxis
                    title: {
                        text: series[1].name.split(/[ ]+/)[0],
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    labels: {
                        format: '{value} ' + unitsHash[series[1].name.split(/[ ]+/)[0]],
                        style: {
                            color: Highcharts.getOptions().colors[1]
                        }
                    },
                    opposite: false
                });
                for (var i = 0; i < series.length; i++) {
                    //put axis for each series
                    series[i].yAxis = !(i & 1) ? 0 : 1;
                }
            }
            createCharts('container-chart-' + id, id, yAxis, series);
        });

        function createCharts(chartName, subType, yAxis, seriesOptions) {
            $('#' + chartName).highcharts('StockChart', {
                exporting: {
                    enabled: true
                },
                chart: {
                    events: {
                        selection: selectPointsByDrag,
                        selectedpoints: selectedPoints,
                        click: unselectByClick
                    },
                    zoomType: 'xy'
                },
                title: {
                    text: subType
                },
                xAxis: {
                    type: 'datetime',
                    title: {
                        text: 'Local Time'
                    }
                },
                yAxis: yAxis,
                series: seriesOptions,
                tooltip: {
                    enabled: true,
                    crosshairs: [true],
                    positioner: function (labelWidth, labelHeight, point) {
                        var tooltipX, tooltipY;
                        if (point.plotX + this.chart.plotLeft < labelWidth && point.plotY + labelHeight > this.chart.plotHeight) {
                            tooltipX = this.chart.plotLeft;
                            tooltipY = this.chart.plotTop + this.chart.plotHeight - 2 * labelHeight - 10;
                        } else {
                            tooltipX = this.chart.plotLeft;
                            tooltipY = this.chart.plotTop + this.chart.plotHeight - labelHeight;
                        }
                        return {
                            x: tooltipX,
                            y: tooltipY
                        };
                    },
                    formatter: function () {
                        var s = moment(this.x).format('YYYY/MM/DD HH:mm:ss');
                        s += '<br/>' + this.series.name + ' <b>' + this.y.toFixed(2) + '</b>';


                        return s;
                    },
                    shared: false
                },
                credits: {
                    enabled: false
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
                            units: [['hour', [60]]]
                        }
			    }, {
                        type: 'day',
                        count: 3,
                        text: '3 Days',
                        dataGrouping: {
                            forced: true,
                            units: [['month', [1]]]
                        }
			    },
                             {
                        type: 'day',
                        count: 1,
                        text: '1 Day',
                        dataGrouping: {
                            forced: true,
                            units: [['day', [1]]]
                        }
			    }],
                    buttonTheme: {
                        width: 60
                    },
                    selected: 2
                },
                legend: {
                    enabled: true,
                    align: 'right',
                    layout: 'vertical',
                    verticalAlign: 'top',
                    y: 100
                }
            }); //end of chart 
        }
    }); //end autorun
}); //end of onRendered

Template.editPoints.onRendered(function () {
    //Need to call dropdown render
    this.$('.ui.dropdown').dropdown({
        //onChange: function (value, text, $selectedItem) {
        onChange: function (value) {
            selectedFlag.set(value);
        }
    });
});

Template.editPoints.helpers({
    points: function () {
        return EditPoints.find({});
    }
});

Template.point.helpers({
    flagSelected: function () {
        return flagsHash[selectedFlag.get()];
    }
});

Template.registerHelper('formatDate', function (epoch) {
    return moment(epoch).format('YYYY/MM/DD HH:mm:ss');
});

Template.site.helpers({
    site: function () {
        return Sites.findOne({
            _id: Router.current().params._id
        });
    },
    selectedDate: function () {
        return moment.unix(endEpoch.get()).format('YYYY-MM-DD');
    },
    charts: function () {
        return Charts.find(); //This gives data to the html below
    }
});

Template.site.events({
    'change #datepicker': function (event) {
        startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
        endEpoch.set(moment.unix(startEpoch.get()).add(1439, 'minutes').unix()); //always to current?
    },
    'click #createPush': function() {
		DataExporter.exportForTCEQ(Router.current().params._id, startEpoch.get(), endEpoch.get());
	}
});