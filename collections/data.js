Monitors = new Mongo.Collection('monitors');
LiveData = new Mongo.Collection('livedata');
AggrData = new Mongo.Collection('aggregatedata5min');

DataSeries = new Mongo.Collection('dataSeries');

//the following should be handled by favorites
Sites = new Meteor.Collection('sites');

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (! Sites.findOne()){
      var sites = [
        {_id: '482010570', name: 'Clear Brooke Highschool'},
        {_id: '481670571', name: 'Clear Creek Highschool'},
        {_id: '482010572', name: 'Clear Lake Highschool'},
        {_id: '482010572', name: 'Smith Point'}
      ];
      sites.forEach(function (site) {
        Sites.insert(site);
      });
    }
  });
}