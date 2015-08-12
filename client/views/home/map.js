Meteor.subscribe('airdata');
Template.map.rendered = function() {
    if (!Session.get('map'))
        gmaps.initialize();
    var instance = this;
        
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
        //var mapCenter = {lat: 29.758864, lng: -95.447520}; // Houston
        //var mapCenter = {lat: 29.428759, lng: -98.515177};  // San Antonio
        var mapCenter = {lat: 30.267153, lng: -97.745177};  // Austin
        instance.subscribe('sitesdata', mapCenter);
        
        var sites = Sites.find({}).fetch();
        _.each(sites, function(aSite) {           
                var markerInfo= '<h3>' + aSite.Name + '</h3>' +
                                'ID: ' + aSite.siteID + '<br/>' +
                                'Address: ' + aSite.Address + 
                                'Cams: ' + aSite.CAMS + '<br/>' +
                                'Region: ' + aSite.TCEQRegion + '<br/>' + 
                                'Activation date: ' + aSite.Active + '<br/>' +
                                'Monitored by: ' + aSite.Owner;
                var aMarker = {
                    lat: aSite.loc[1],
                    lng: aSite.loc[0],
                    title: aSite.Name,
                    content: markerInfo
                };
                gmaps.addMarker(aMarker);  
        });
});
}

Template.map.destroyed = function() {
    Session.set('map', false);
}