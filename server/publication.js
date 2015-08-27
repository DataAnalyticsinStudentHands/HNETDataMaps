/*Meteor.publish('data2014', function(siteID, epoch, numOfRec) {
    //Meteor._sleepForMs(5000);
    var start = epoch - numOfRec*60*5;
    return Data2014.find({$and: 
                         [
                            {siteID: siteID},                          
                            {epoch: {$gt: start}},
                            {epoch: {$lt: epoch}}
                         ]
                         });
});*/
Meteor.publish('airdata', function() {
    return Air.find();
});
Meteor.publish('maincampus', function() {
    return UHMain.find();
});
Meteor.publish('sitesdata', function(currentLocation) {
    return Sites.find({loc: {$near: [currentLocation.lng, currentLocation.lat]}}, {limit: 15});
});

Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'other': 1, 'things': 1}});
  } else {
    this.ready();
  }
});