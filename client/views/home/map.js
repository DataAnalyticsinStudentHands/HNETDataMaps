Meteor.subscribe('airdata');



Template.map.rendered = function() {
    if (!Session.get('map'))
        gmaps.initialize();

	
    var instance = this;
    var marker;
        
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
        

        var latLng = Geolocation.latLng();
        console.log(latLng);
      if (latLng){
        

      // If the marker doesn't yet exist, create it.
      if (! marker) {
        marker = {
          lat:latLng.lat,
          lng:latLng.lng,
          title: 'CurrentLocation',
          content: 'You are here'
        };
        gmaps.addMarker(marker);
      }
      
  }
        Meteor.subscribe('sitesdata', latLng);
        var sites = Sites.find({}).fetch();
        var contentString = null;


        _.each(sites, function(site) {   
                contentString = document.createElement('a');
                contentString.setAttribute('href', site.url);
                contentString.appendChild(document.createTextNode(site.siteName));        
                var aMarker = {
                    lat: site.location[1],
                    lng: site.location[0],
                    title: site.siteName,
                    content: contentString
                };
                
                gmaps.addMarker(aMarker);  
        });
       // Meteor.subscribe("userData");
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
