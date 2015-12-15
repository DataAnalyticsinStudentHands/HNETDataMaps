var startEpoch = new ReactiveVar(moment().subtract(1, 'days').unix()); //24 hours ago - seconds
var endEpoch = new ReactiveVar(moment().unix());

Highcharts.setOptions({
    global: {
        useUTC: false
    }
});

var flagsHash = {
    0: 'black',
    K: 'red',
    Q: 'darkgreen',
    N: 'blue',
    P: 'yellow' 
};

//placeholder for dynamic chart containers
var Charts = new Meteor.Collection(null);   //This will store our synths

Template.composite.onRendered(function () {
    Tracker.autorun(function () {
        //add notes to documents?
        //need to figure out better management of Tracker.autorun - it runs too often

        var siteList = ['4811670571', '482010570', '482010572']; //should be dynamic
        Meteor.subscribe('compositeSeries', siteList, startEpoch.get(), endEpoch.get());

        var seriesOptions = {};
        Charts.remove({});

        var allSeries = DataSeries.find({}).fetch();
        _.each(allSeries, function (data) {
            //Create individual data series for plotting - here we plot by measurement
            _.each(data.datapoints, function (datapoints, i) {
                var seriesName = data.subType + '_' + i;
                if (!seriesOptions[seriesName]) {
                    seriesOptions[seriesName] = [];
                }
                seriesOptions[seriesName].push({
                    name: i + ' ' + data._id.split(/[_]+/).pop(),
                    type: data.chartType,
                    lineWidth: data.lineWidth,
                    allowPointSelect: data.allowPointSelect,
                    data: datapoints,
                    zIndex: data.zIndex,
                    marker: {
                        radius: 2
                    }

                });
            });
        });

        _.each(seriesOptions, function (series, id) {            
            Charts.insert({id:id});
            createCharts('container-chart-' + id, id, series);
        });

        function createCharts(chartName, subType, seriesOptions) {

            $('#' + chartName).highcharts('StockChart', {
                exporting: {
                    enabled: true
                },
                chart: {
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
                yAxis: {
                    title: {
                        text: subType
                    }
                },
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
                        type: 'month',
                        count: 3,
                        text: 'Day',
                        dataGrouping: {
                            forced: true,
                            units: [['day', [1]]]
                        }
			    }, {
                        type: 'minute',
                        count: 60,
                        text: 'Hour',
                        dataGrouping: {
                            forced: true,
                            units: [['hour', [60]]]
                        }
			    }, {
                        type: 'all',
                        text: 'All',
                        dataGrouping: {
                            forced: true,
                            units: [['month', [1]]]
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

Template.registerHelper('formatDate', function (epoch) {
    return moment(epoch).format('YYYY/MM/DD HH:mm:ss');
});

Template.composite.helpers({
    selectedDate: moment.unix(startEpoch.get()).format('YYYY-MM-DD'),
    charts: function() {
        return Charts.find();  //This gives data to the html below
    }
});

Template.composite.events({
    'change #datepicker': function (event) {
        startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
        endEpoch.set(moment.unix(startEpoch.get()).add(1, 'days').unix()); //always to current?
    }
});