Meteor.startup(function() {
    if (Air.find().count() === 0) {    
    var sampleAirData = [
        {//1
            siteName: 'UH - Main Campus',
            location: {lat: 29.7176, lng: -95.3414},
            elevation: '70m (229.7ft)',
            state: 'Texas',
            county: 'Harris',
            city: 'Houston',
            maintainer: 'University of Houston',
            photoURL: 'img/sites/Moody_Tower.jpg',
            url: 'maincampus',
            temperature: 88.3,
            humidity: 50,
            wind: {direction: 114, speed: 17.3},
            barometer: 1005,
            precipitation: 0.2,
            ozone: 30,
            CO: 102
        },
        {//2
            siteName: 'Jones State Forest',
            location: {lat: 30.2362, lng: -95.4832},
            elevation: '56m (183.7ft)',
            state: 'Texas',
            county: 'Montgomery',
            city: 'Houston',
            maintainer: 'University of Houston',
            photoURL: 'img/sites/Jones_State.jpg',
            url: 'jonesstate',
            temperature: 89.8,
            humidity: 48,
            wind: {direction: 130, speed: 7.4},
            barometer: 1004,
            precipitation: 0.2,
            ozone: 50,
            CO: 90 
        },
        {//3
            siteName: 'West Liberty Airport',
            location: {lat: 30.0583, lng: -94.9781},
            elevation: '24m (80.0ft)',
            state: 'Texas',
            county: 'Liberty',
            city: 'Houston',
            maintainer: 'University of Houston',
            photoURL: 'img/sites/Liberty_Airport.jpg',
            url: 'libertyairport',
            temperature: 87.5,
            humidity: 52,
            wind: {direction: 134, speed: 9.9},
            barometer: 1008,
            precipitation: 0.11,
            ozone: 28,
            CO: -1  // -1 indicates NA 
        },
        {//4
            siteName: 'UH - Sugar Land',
            location: {lat: 29.5741, lng: -95.6497},
            elevation: '23m (75.5ft)',
            state: 'Texas',
            county: 'Fort Bend',
            city: 'Houston',
            maintainer: 'University of Houston',
            photoURL: 'img/sites/Sugar_Land.jpg',
            url: 'sugarland',
            temperature: 78.3,
            humidity: 89,
            wind: {direction: 186, speed: 13.8},
            barometer: 1013,
            precipitation: 1.44,
            ozone: 28,
            CO: 121
        },
        {//5
            siteName: 'UH - Coastal Center',
            location: {lat: 29.3879, lng: -95.0414},
            elevation: '5m (16.4ft)',
            state: 'Texas',
            county: 'Galveston',
            city: 'Houston',
            maintainer: 'University of Houston',
            photoURL: 'img/sites/Coastal_Center.jpg',
            url: 'coastalcenter',
            temperature: 80.1,
            humidity: 91,
            wind: {direction: 213, speed: 6.8},
            barometer: 1011,
            precipitation: 1.02,
            ozone: 19,
            CO: 95
        }
    ];
    
    // loop through each sample location and insert into the database
    _.each(sampleAirData, function(air) {
        Air.insert(air);
    });    
    
}
});
Meteor.publish('airdata', function() {
    return Air.find();
});
Meteor.publish('maincampus', function() {
    return UHMain.find();
});