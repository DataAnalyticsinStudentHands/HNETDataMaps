//var queryObj = ['48_201_0695', 1397143800, 6*12];
//Meteor.subscribe('data2014', queryObj[0], queryObj[1], queryObj[2]);
Template.history.onCreated(function() {
    var instance = this;
    var queryArgsLocal = ['48_201_0695', 1399735800, 3*12];
    instance.autorun(function() {
            //var queryArgs = ['48_201_0695', 1388766600, 6*12];             
            instance.subscribe('data2014', queryArgsLocal[0], queryArgsLocal[1], queryArgsLocal[2]);
            //var queryArgsLocal = Session.get('queryArgs');
        });
    instance.fedData = function() {    
        return Data2014.find({}, {sort: {epoch: -1}});
    };
                     
});

Template.history.events({    
    'submit form': function(event) {
        //event.preventDefault();
        var date = new Date();
        date.setDate(event.target.day.value);
        date.setFullYear(event.target.year.value);
        date.setMonth(event.target.month.value);
        date.setHours(event.target.hour.value);
        date.setMinutes(event.target.min.value);
        date.setSeconds(0);
        date.setMilliseconds(0);        
        var epoch = date.getTime()/1000;
        alert("You selected time: " + date + " with epoch: " + epoch);
        var plot = event.target.plot.value;
        var duration = event.target.duration.value;
        var siteID = '48_201_0695';
        var inputQueryArg = ['48_201_0695', epoch, duration];
               
        Session.set('queryArgs', inputQueryArg);        
    }    
});

Template.history.helpers({
    
    historyData: function() {        
        return Template.instance().fedData();
    },    
    
    historyGraph: function(){
        
        var dataCursor = Data2014.find({}, {sort: {epoch: -1}});
        var tempData = [];
        var humidData = [];
        var ozoneData = [];
        dataCursor.forEach(function(time) {
            tempData.push({x: new Date(time.epoch*1000),
                                y: time.temp,
                                name: new Date(time.epoch*1000)
                               });
            humidData.push({x: new Date(time.epoch*1000),
                                y: time.humid,
                                name: new Date(time.epoch*1000)
                               });
            ozoneData.push({x: new Date(time.epoch*1000),
                                y: time.o3,
                                name: new Date(time.epoch*1000)
                               });
            });
        var charObj =  {
                chart: {
                    type: 'scatter',
                    plotBorderWidth: 1
                },
                xAxis: {
                    type: 'datetime'
                },
                title: {
                    text: "Historical Data"
                },
                plotOptions: {
                    scatter: {
                        allowPointSelect: true           
                    }
                },
                series: [
                         {
                            name: "Temperature",
                            data: tempData
                         },
                         {
                             name: "Humidity",
                             data: humidData
                         },
                         {
                             name: "Ozone",
                             data: ozoneData
                         }]        
            };
        return charObj;
    },    
    
    epochToDate: function(epoch) {
        var dateTime = new Date(epoch*1000);
        var monthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        return dateTime.getFullYear() + ' ' + monthsName[dateTime.getMonth()] + '-' +
            dateTime.getDate() + ' @ ' + dateTime.getHours() + ":" +
            dateTime.getMinutes();
    }
});
