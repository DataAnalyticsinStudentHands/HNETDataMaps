Template.home.onRendered(function () {

    var latude = 29.721; //Houston
    var lngtude = -95.3443;
    
    var AQmap = L.map('displayMap', {
        doubleClickZoom: false
    });
    
    Meteor.subscribe('sites', [lngtude, latude]);
    Sites.find().observeChanges({
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

    AQmap.setView([latude, lngtude], 9);
    
    L.tileLayer.provider('OpenStreetMap.DE').addTo(AQmap);

});

