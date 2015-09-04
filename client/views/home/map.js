Meteor.subscribe('airdata');
var mapCenter = null;


Template.map.rendered = function() {
    if (!Session.get('map'))
        gmaps.initialize();
        gmaps.findlocation();

	
    var instance = this;
        
    // keep updating info on map with changes in database
    Tracker.autorun(function() {
        // var locations = Air.find().fetch();        
        // _.each(locations, function(loc) {           
        //         var markerInfo= '<h3>' + loc.siteName + '</h3>' +
        //                         'Temperature: ' + loc.temperature + '&#186F<br/>' +
        //                         'Humidity: ' + loc.humidity + '&#37<br/>' + 
        //                         'Wind: ' + loc.wind.direction + '&#186 at ' + loc.wind.speed + 'mph<br/>' +
        //                         'Barometer: ' + loc.barometer + 'hpa<br/>' + 
        //                         '<a href="/' + loc.url + '">Click here for details</a>';
        //         var objMarker = {
        //             lat: loc.location.lat,
        //             lng: loc.location.lng,
        //             title: loc.siteName,
        //             content: markerInfo
        //         };
        //         gmaps.addMarker(objMarker);
            
            // });
        
        
//        Meteor.subscribe('sitesdata', );
        
        var sites = Sites.find({}).fetch();
        _.each(sites, function(site) {           
                var aMarker = {
                    lat: site.location[1],
                    lng: site.location[0],
                    title: site.Name,
                    content: site.Name
                };
                
                gmaps.addMarker(aMarker);  
        });
        Meteor.subscribe("userData");
});
 
    
}

Template.map.events({
    "click .add-favorite": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("addFave", mapCenter);
    },
    "click .delete-favorite": function () {
      Meteor.call("deleteFave", this._id);
    }
  });
