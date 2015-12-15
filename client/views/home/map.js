Template.mainMap.onRendered(function () {

    var latude = 29.721; //Houston
    var lngtude = -95.3443;
    
    var AQmap = L.map('displayMap', {
        doubleClickZoom: false
    });
    
    var geoloc = function () {
        var geooptions = {
            enableHighAccuracy: true,
            timeout: 80000,
            maximumAge: 10000
        };

        function success(pos) {
            console.log('your position', pos);
            latude = pos.coords.latitude;
            lngtude = pos.coords.longitude;
            AQmap.setView([latude, lngtude], 9);
            var marker = L.marker([latude, lngtude], {
                title: 'You are here'
            }).addTo(AQmap);
            var contentHTML = '<div>This is where you are</div>';
            marker.bindPopup(contentHTML);
        }

        function error(err) {
            latude = 29.7604;
            lngtude = -95.3698;
            console.warn('Warning(' + err.code + '): ' + err.message);
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error, geooptions);
        }
        Meteor.subscribe('monitors', [lngtude, latude]);
        return [lngtude, latude];
    };
    var herenow = geoloc('hereNow'); //later for passing clicks, etc. - hereNow should allow to get around no navigator etc.

    Monitors.find().observeChanges({
        added: function (id, line) {
                var marker = L.marker([line.loc.coordinates[1], line.loc.coordinates[0]], {
                    title: line['site name'] + line.AQSID
                }).addTo(AQmap);
                
                var content = "<a href='/site/" + line.AQSID + "'> pathfor this AQSID" + line.AQSID + ":  " + line['site name'] + "</a>";
                marker.bindPopup(content);
            } //end of added

    });
    $('#displayMap').css('height', window.innerHeight - 20);
    L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

    AQmap.setView(herenow, 9);
    L.tileLayer.provider('OpenStreetMap.DE').addTo(AQmap);

});

Template.mainMap.helpers({ 
    mapCollectionDistance: function () {
        return Monitors.find().count();
    }
});