gmaps = {
    // map object
    map: null, 
    // google markers objects
    markers: [], 
    // google lat lng objects
    latLngs: [], 
    // our formatted marker data objects
    //markerData: [],      
        
    // intialize the map
    initialize: function() { 
        
       
        var mapOptions = {
                center: new google.maps.LatLng(29.721024, -95.341939),
                //center: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                zoom: 9,
                scaleControl: false,                
                zoomControl: true,
                mapTypeControl: true,
                panControl: false,
                rotateControl: true,
                overviewMapControl: false, 
                streetViewControl: false                    
            };        
 
        this.map = new google.maps.Map(
            document.getElementById('map-canvas'),
            mapOptions
        );      
        
        // global flag saying we intialized already
        Session.set('map', true);       
    },
    
    markerExists: function(key, val) {
        _.each(this.markers, function(storedMarker) {
            if (storedMarker[key] == val)
                return true;
        });
        return false;
    },
    
    calcBounds: function() {
        var bounds = new google.maps.LatLngBounds();
        for (var i=0; i < this.latLngs.length; i++) {
            bounds.extend(this.latLngs[i]);
        }
        this.map.fitBounds(bounds);
        
    },

 findlocation: function() {
        if(navigator.geolocation) {
        navigator.geolocation.watchPosition(gmaps.showPosition, function() {
        handleNoGeolocation(true);
        });
        }   else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
        }
        },
        
        showPosition: function(position) {
        pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var purpStar = {
            path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
            fillColor: 'lavender',
            fillOpacity: 0.8,
            scale: 0.1,
            strokeColor: 'plum',
            strokeWeight: 2
        };
       
        var marker = {
            lat: pos.lat,
            lng: pos.lng,
        };
    	gmaps.addMarker(marker);
        
        
        },
    
    addMarker: function(marker) {
        var gLatLng = new google.maps.LatLng(marker.lat, marker.lng);
        var gMarker = new google.maps.Marker({
            position: gLatLng,
            map: this.map,
            title: marker.title
        });
        var infowindow = new google.maps.InfoWindow({
            content: marker.content
        });        
        var clicked_infowindow = new google.maps.InfoWindow({
            content: marker.content
        });
        
        google.maps.event.addListener(this.map, 'click', function() {            
            clicked_infowindow.close();
            
        });
        
        google.maps.event.addListener(gMarker, 'mouseover', function() {            
            infowindow.open(this.map, this);
        });
         
        google.maps.event.addListener(gMarker, 'click', function() {
            this.map.setZoom(13);
            this.map.setCenter(gMarker.getPosition());
            clicked_infowindow.open(this.map, this);
            
        });
        google.maps.event.addListener(gMarker, 'mouseout', function() {
            infowindow.close();
        });
        
        this.latLngs.push(gLatLng);
        this.markers.push(gMarker);
        //this.markerData.push(marker);
    return gMarker;
    }
}
