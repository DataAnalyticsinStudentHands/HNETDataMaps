Meteor.subscribe('maincampus');

Template.maincampus.onCreated(function() {
    this.subscribe('airdata');
});
                              
Template.maincampus.helpers({
    siteInfo: function() {
        var info = Air.find({url: 'maincampus'}).fetch();
        return info[0];
    },
    
    epochToDate: function(epoch) {
        var dateTime = new Date(epoch*1000);               
        return dateTime.getHours() + ":" + dateTime.getMinutes();
    },
    
    geoInfo: function() {
        return UHMain.find({}, {sort: { epoch: 1 }});
    },
    windDirObj: function() {
        return {
            chart: {
                type: 'gauge'
            },
            title: {
                text: 'Wind Direction'
            },
            credits: {
                enabled: false
            },
            pane: {
                startAngle: 0
            },
            plotOptions: {
                gauge: {
                    dataLabels: {
                        enabled: true,
                        format: '{y}\u00B0' 
                    }
                }
            },
            yAxis: {
                min: 0,
                max: 360,
                allowDecimals: true,
                labels: {
                    enabled: false
                }
            },
            series: [{
                name: 'Direction',
                data: [114],
                tooltips: {
                    valueSuffix: 'deg'
                }
            }]
        };
    },
    windSpdObj: function() {
        return {
            chart: {
                type: 'gauge'
            },
            title: {
                text: 'Wind Speed'
            },
            credits: {
                enabled: true,
                href: "http://hnet.uh.edu",
                text: "HNET-UH"
            },
            pane: {
                startAngle: -120,
                endAngle: 120                
            },
            plotOptions: {
                gauge: {
                    dataLabels: {
                        enabled: true,
                        format: '{y} mph' 
                    }
                }
            },
            yAxis: {
                min: 0,
                max: 50,
                plotBands: [{
                    from: 0,
                    to: 30,
                    color: '#55BF3B' // green
                },
                            {
                    from: 30,
                    to: 40,
                    color: '#DDDF0D' // yellow
                }, 
                            {
                    from: 40,
                    to: 50,
                                color: '#DF5353' // red
                            }]
            },
            series: [{
                name: 'Speed',
                data: [17.3],
                tooltips: {
                    valueSuffix: 'deg'
                }
            }]
        };
    },
    chartGeneralOptions: function() {
        var ozoneCursor = UHMain.find({}, {sort: { epoch: 1 }, 
                                    fields: { epoch: 1, o3: 1}});
        var ozoneData = [];
        ozoneCursor.forEach(function(date) {
            ozoneData.push({x: new Date(date.epoch*1000),
                        y: date.o3,
                        name: new Date(date.epoch*1000)
            });
        });
        
        var humidCursor = UHMain.find({}, {sort: { epoch: 1 }, 
                                    fields: { epoch: 1, humid: 1}});
        var humidData = [];
        humidCursor.forEach(function(date) {
            humidData.push({x: new Date(date.epoch*1000),
                        y: date.humid,
                        name: new Date(date.epoch*1000)
            });
        });
        
        return {            
            xAxis: {
                type: 'datetime'
            },
            title: {
                    text: "Humidity and Ozone for the last 24h"
            },
            credits: {
                href: "http://hnet.uh.edu",
                text: "HNET-UH"
            },            
            legend: {
                layout: "vertical",
                align: "left",
                verticalAlign: "top",
                floating: true,
                x: 100,
                y: 50,
                borderWidth: 1
            },
            plotOptions: {
                areaspline: {
                    allowPointSelect: true,
                    animation: true,
                    enableMouseTracking: true                
                },
                scatter: {
                    allowPointSelect: true,
                    animation: true,
                    marker: {
                        radius: 2
                    },
                    enableMouseTracking: true,
                    color: "#5CA221"
                },
                spline: {
                    allowPointSelect: true,
                    animation: true,
                    enableMouseTracking: true                
                }
            },                            
            series: [                 
                {
                    
                    type: "scatter",
                    name: "Ozone",
                    data: ozoneData,
                    color: '#5CA221'                    
                }
                ,
                {
                    type: "spline",
                    name: "Humidity",
                    data: humidData,
                    color: '#C764FC'
                }
            ]
        }
    },
    
    maincampustemp: function() {
    var heatCursor = UHMain.find({}, {sort: { epoch: 1 }, 
                                    fields: { epoch: 1, temp: 1}});
    var heatData = [];
    heatCursor.forEach(function(date) {
        heatData.push({x: new Date(date.epoch*1000),
                      y: date.temp,
                      name: new Date(date.epoch*1000),
                      color: "#00FF00"});
    });
    return {
        chart: {
            type: 'spline'
        },
        xAxis: {
            type: 'datetime'
        },
        title: {
            text: "Temperature  for the last 24h"
        },
        credits: {
                enabled: true,
                href: "http://hnet.uh.edu",
                text: "HNET"
        },
        series: [{
            name: "Temperature",
            data: heatData
            }]        
    };
    },
    
    maincampusozone: function() {
    var ozoneCursor = UHMain.find({}, {sort: { epoch: 1 }, 
                                    fields: { epoch: 1, o3: 1}});
    var ozoneData = [];
    ozoneCursor.forEach(function(date) {
        ozoneData.push({x: new Date(date.epoch*1000),
                        y: date.o3,
                        name: new Date(date.epoch*1000),
                        color: 'FF0000'});
    });
    return {
        chart: {
            type: 'scatter',
            plotBorderWidth: 1
        },
        xAxis: {
            type: 'datetime'
        },
        title: {
            text: "Ozone for the last 24h"
        },
        /*plotOptions: {
            scatter: {
                allowPointSelect: true
                //animation: true             
            }
        },*/
        series: [{
            name: "Ozone",
            data: ozoneData
        }]        
    };
    },
    
    maincampushumid: function() {
    var humidCursor = UHMain.find({}, {sort: { epoch: 1 }, 
                                    fields: { epoch: 1, humid: 1}});
    var humidData = [];
    humidCursor.forEach(function(date) {
        humidData.push({x: new Date(date.epoch*1000),
                      y: date.humid,
                      name: new Date(date.epoch*1000),
                      color: "#FF0000"});
    });
    return {
        chart: {
            type: 'spline'
        },
        xAxis: {
            type: 'datetime'
        },
        title: {
            text: "Humidity for the last 24h"
        },
        credits: {
                enabled: true,
                href: "http://hnet.uh.edu",
                text: "HNET"
        },
        plotOptions: {
            spline: {
                allowPointSelect: true,
                //animation: true,
                enableMouseTracking: true                
            }
        },        
        series: [{
            name: "Humidity",
            data: humidData
        }]        
    };
    }
            
    
});