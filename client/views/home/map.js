Meteor.subscribe('airdata');
Template.map.rendered = function() {
    if (!Session.get('map'))
        gmaps.initialize();
    
    // keep updating info on map with changes in database
    Tracker.autorun(function() {
        var locations = Air.find().fetch();
        
        _.each(locations, function(loc) {           
                var markerInfo= '<h3>' + loc.siteName + '</h3>' +
                                'Temperature: ' + loc.temperature + '&#186F<br/>' +
                                'Humidity: ' + loc.humidity + '&#37<br/>' + 
                                'Wind: ' + loc.wind.direction + '&#186 at ' + loc.wind.speed + 'mph<br/>' +
                                'Barometer: ' + loc.barometer + 'hpa<br/>' + 
                                '<a href="/' + loc.url + '">Click here for details</a>';
                var objMarker = {
                    lat: loc.location.lat,
                    lng: loc.location.lng,
                    title: loc.siteName,
                    content: markerInfo
                };
                gmaps.addMarker(objMarker);
            
            });
        
        gmaps.calcBounds();
        
        });
    
    
};

Template.map.destroyed = function() {
    Session.set('map', false);
}