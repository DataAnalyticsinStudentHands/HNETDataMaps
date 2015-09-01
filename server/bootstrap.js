

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
    
};
    
    if (Sites.find().count() === 0) { 
    var SitesData = [
  {
    "AQS_Code": "480055013",
    "siteID": "48_005_5013",
    "CAMS": "5013",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Lufkin KLFK",
    "Address": "Angelina County Airport",
    "loc": [
      -94.75,
      31.233889
    ],
    "Active": "2-Sep-05",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "480210684",
    "siteID": "48_021_0684",
    "CAMS": "684",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "McKinney Roughs",
    "Address": "1884 State Hwy 71 W",
    "loc": [
      -97.4588971,
      30.140877
    ],
    "Active": "16-Aug-06",
    "Deactive": "",
    "Owner": "Capitol Area Council of Governments"
  },
  {
    "AQS_Code": "480271045",
    "siteID": "48_027_1045",
    "CAMS": "1045",
    "TCEQRegion": "WACO",
    "Region": "9",
    "Name": "Temple Georgia",
    "Address": "8406 Georgia Avenue",
    "loc": [
      -97.4310523,
      31.1224187
    ],
    "Active": "4-Oct-13",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480271047",
    "siteID": "48_027_1047",
    "CAMS": "1047",
    "TCEQRegion": "WACO",
    "Region": "9",
    "Name": "Killeen Skylark Field",
    "Address": "1605 Stone Tree Drive",
    "loc": [
      -97.6797343,
      31.0880022
    ],
    "Active": "11-Jun-09",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480290032",
    "siteID": "48_029_0032",
    "CAMS": "23",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "San Antonio Northwest",
    "Address": "6655 Bluebird Lane",
    "loc": [
      -98.620166,
      29.51509
    ],
    "Active": "1-Jul-81",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480290051",
    "siteID": "48_029_0051",
    "CAMS": "140",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "San Antonio Seale",
    "Address": "254 Seale Road",
    "loc": [
      -98.406501,
      29.4450463
    ],
    "Active": "13-Jul-94",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480290052",
    "siteID": "48_029_0052",
    "CAMS": "58",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Camp Bullis",
    "Address": "F Range (1000Yd marker off Wilderness Trail) Near Wilderness Rd",
    "loc": [
      -98.5649364,
      29.6320582
    ],
    "Active": "10-Aug-98",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480290053",
    "siteID": "48_029_0053",
    "CAMS": "301",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Selma",
    "Address": "16289 North Evans Rd #2",
    "loc": [
      -98.3125118,
      29.5877408
    ],
    "Active": "6-Oct-99",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480290055",
    "siteID": "48_029_0055",
    "CAMS": "678",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "CPS Pecan Valley",
    "Address": "802 Pecan Valley Drive",
    "loc": [
      -98.431251,
      29.4072945
    ],
    "Active": "11-Mar-99",
    "Deactive": "",
    "Owner": "San Antonio City Public Services"
  },
  {
    "AQS_Code": "480290059",
    "siteID": "48_029_0059",
    "CAMS": "59",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Calaveras Lake",
    "Address": "14620 Laguna Rd",
    "loc": [
      -98.3116919,
      29.2753812
    ],
    "Active": "12-May-98",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480290060",
    "siteID": "48_029_0060",
    "CAMS": "",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Frank Wing Municipal Court",
    "Address": "401 South Frio St",
    "loc": [
      -98.505381,
      29.4221832
    ],
    "Active": "18-May-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480290501",
    "siteID": "48_029_0501",
    "CAMS": "501",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Elm Creek Elementary",
    "Address": "11535 Pearsall Rd",
    "loc": [
      -98.724444,
      29.276667
    ],
    "Active": "17-Jun-02",
    "Deactive": "",
    "Owner": "Alamo Area Council of Governments"
  },
  {
    "AQS_Code": "480290502",
    "siteID": "48_029_0502",
    "CAMS": "502",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Fair Oaks Ranch",
    "Address": "7286 Dietz Elkhorn Rd",
    "loc": [
      -98.625556,
      29.73
    ],
    "Active": "27-Jun-02",
    "Deactive": "",
    "Owner": "Alamo Area Council of Governments"
  },
  {
    "AQS_Code": "480290622",
    "siteID": "48_029_0622",
    "CAMS": "622",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Heritage Middle School",
    "Address": "7145 Gardner Road",
    "loc": [
      -98.3328207,
      29.3529047
    ],
    "Active": "29-Jul-04",
    "Deactive": "",
    "Owner": "San Antonio City Public Services"
  },
  {
    "AQS_Code": "480290623",
    "siteID": "48_029_0623",
    "CAMS": "623",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Gardner Rd. Gas Sub-Station",
    "Address": "9599 Gardner Road",
    "loc": [
      -98.3258333,
      29.3319444
    ],
    "Active": "28-Jun-05",
    "Deactive": "",
    "Owner": "San Antonio City Public Services"
  },
  {
    "AQS_Code": "480290625",
    "siteID": "48_029_0625",
    "CAMS": "625",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Gate 9A CPS",
    "Address": "12941 Cassiano Road",
    "loc": [
      -98.3377778,
      29.2922222
    ],
    "Active": "1-Jun-05",
    "Deactive": "",
    "Owner": "San Antonio City Public Services"
  },
  {
    "AQS_Code": "480290626",
    "siteID": "48_029_0626",
    "CAMS": "626",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Gate 58 CPS",
    "Address": "1100 Hildebrandt",
    "loc": [
      -98.3316667,
      29.3177778
    ],
    "Active": "1-Jun-05",
    "Deactive": "",
    "Owner": "San Antonio City Public Services"
  },
  {
    "AQS_Code": "480290676",
    "siteID": "48_029_0676",
    "CAMS": "676",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Palo Alto",
    "Address": "9011 Poteet Jourdanton Hwy",
    "loc": [
      -98.5513832,
      29.3327898
    ],
    "Active": "1-Aug-06",
    "Deactive": "",
    "Owner": "San Antonio Metropolitan Health District"
  },
  {
    "AQS_Code": "480290677",
    "siteID": "48_029_0677",
    "CAMS": "677",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Old Hwy 90",
    "Address": "911 Old Hwy 90 West",
    "loc": [
      -98.5804991,
      29.4239439
    ],
    "Active": "9-Oct-06",
    "Deactive": "",
    "Owner": "San Antonio Metropolitan Health District"
  },
  {
    "AQS_Code": "480291069",
    "siteID": "48_029_1069",
    "CAMS": "1069",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "San Antonio Interstate 35",
    "Address": "9904 IH 35 N",
    "loc": [
      -98.39139,
      29.5294
    ],
    "Active": "8-Jan-14",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480370004",
    "siteID": "48_037_0004",
    "CAMS": "",
    "TCEQRegion": "TYLER",
    "Region": "5",
    "Name": "Texarkana",
    "Address": "2315 W 10th Street",
    "loc": [
      -94.0708021,
      33.4257582
    ],
    "Active": "1-Jan-99",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480390618",
    "siteID": "48_039_0618",
    "CAMS": "618",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Danciger",
    "Address": "FM 1459 @ County Road 924",
    "loc": [
      -95.765,
      29.148889
    ],
    "Active": "1-Jun-03",
    "Deactive": "",
    "Owner": "Brazoria County - Sweeny Industry Group"
  },
  {
    "AQS_Code": "480390619",
    "siteID": "48_039_0619",
    "CAMS": "619",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Mustang Bayou",
    "Address": "FM 2917 @ County Road 169",
    "loc": [
      -95.19991,
      29.308562
    ],
    "Active": "1-Jun-03",
    "Deactive": "",
    "Owner": "Brazoria County - Chocolate Bayou Industry Group"
  },
  {
    "AQS_Code": "480391003",
    "siteID": "48_039_1003",
    "CAMS": "11",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Clute",
    "Address": "426 Commerce Street",
    "loc": [
      -95.397744,
      29.0108409
    ],
    "Active": "1-Jan-74",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480391004",
    "siteID": "48_039_1004",
    "CAMS": "84",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Manvel Croix Park",
    "Address": "4503 Croix Pkwy",
    "loc": [
      -95.3925089,
      29.5204432
    ],
    "Active": "23-Aug-01",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480391012",
    "siteID": "48_039_1012",
    "CAMS": "1012",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Freeport South Avenue I",
    "Address": "207 South Avenue I",
    "loc": [
      -95.35483,
      28.96443
    ],
    "Active": "25-May-11",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480391016",
    "siteID": "48_039_1016",
    "CAMS": "1016",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Lake Jackson",
    "Address": "109B Brazoria Hwy 332 West",
    "loc": [
      -95.4729462,
      29.0437592
    ],
    "Active": "10-Jun-03",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480415011",
    "siteID": "48_041_5011",
    "CAMS": "5011",
    "TCEQRegion": "WACO",
    "Region": "9",
    "Name": "College Station KCLL",
    "Address": "Easterwood Field Airport",
    "loc": [
      -96.3511111,
      30.5822222
    ],
    "Active": "2-Sep-05",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "480430101",
    "siteID": "48_043_0101",
    "CAMS": "0067, 0316, 0656, 0691 ",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Bravo Big Bend",
    "Address": "Big Bend National Park",
    "loc": [
      -103.1779076,
      29.3025518
    ],
    "Active": "1-Oct-90",
    "Deactive": "",
    "Owner": "National Park Service"
  },
  {
    "AQS_Code": "480535009",
    "siteID": "48_053_5009",
    "CAMS": "5009",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Burnet County Airport KBMQ",
    "Address": "Burnet County Airport",
    "loc": [
      -98.2386111,
      30.7388889
    ],
    "Active": "17-Jun-04",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "480551604",
    "siteID": "48_055_1604",
    "CAMS": "1604",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Lockhart",
    "Address": "214 Bufkin Lane",
    "loc": [
      -97.664936,
      29.864917
    ],
    "Active": "24-Apr-14",
    "Deactive": "",
    "Owner": "Capitol Area Council of Governments"
  },
  {
    "AQS_Code": "480610006",
    "siteID": "48_061_0006",
    "CAMS": "0080, 0180 ",
    "TCEQRegion": "HARLINGEN",
    "Region": "15",
    "Name": "Brownsville",
    "Address": "344 Porter Drive",
    "loc": [
      -97.4938295,
      25.8925176
    ],
    "Active": "1-Jul-93",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480611023",
    "siteID": "48_061_1023",
    "CAMS": "1023",
    "TCEQRegion": "HARLINGEN",
    "Region": "15",
    "Name": "Harlingen Teege",
    "Address": "1602 W Teege Avenue",
    "loc": [
      -97.7126837,
      26.2003347
    ],
    "Active": "9-Oct-12",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480612004",
    "siteID": "48_061_2004",
    "CAMS": "0323, 0667 ",
    "TCEQRegion": "HARLINGEN",
    "Region": "15",
    "Name": "Isla Blanca Park",
    "Address": "Lot B 69 1/2",
    "loc": [
      -97.1621996,
      26.0696153
    ],
    "Active": "1-Aug-05",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480650004",
    "siteID": "48_065_0004",
    "CAMS": "104",
    "TCEQRegion": "AMARILLO",
    "Region": "1",
    "Name": "Pantex 4",
    "Address": "SW of FM 293 & FM 2373 Intersection",
    "loc": [
      -101.587083,
      35.3359717
    ],
    "Active": "29-Jan-04",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480650005",
    "siteID": "48_065_0005",
    "CAMS": "105",
    "TCEQRegion": "AMARILLO",
    "Region": "1",
    "Name": "Pantex 5",
    "Address": "W of FM 293 & FM 2373 Intersection",
    "loc": [
      -101.5806223,
      35.3529795
    ],
    "Active": "13-Jan-04",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480650007",
    "siteID": "48_065_0007",
    "CAMS": "79",
    "TCEQRegion": "AMARILLO",
    "Region": "1",
    "Name": "Pantex 7",
    "Address": "Masterson Pump Station",
    "loc": [
      -101.5608419,
      35.382749
    ],
    "Active": "12-Jul-99",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480710013",
    "siteID": "48_071_0013",
    "CAMS": "0096, 0638 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Smith Point Hawkins Camp",
    "Address": "1850 Hawkins Camp Rd",
    "loc": [
      -94.7869686,
      29.5462437
    ],
    "Active": "6-Sep-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480850003",
    "siteID": "48_085_0003",
    "CAMS": "",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Frisco 5th St",
    "Address": "7471 South 5th Street",
    "loc": [
      -96.8246832,
      33.1423361
    ],
    "Active": "1-Jan-84",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480850005",
    "siteID": "48_085_0005",
    "CAMS": "0031, 0680 ",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Frisco",
    "Address": "6590 Hillcrest Road",
    "loc": [
      -96.7864188,
      33.1324003
    ],
    "Active": "7-May-92",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480850007",
    "siteID": "48_085_0007",
    "CAMS": "",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Frisco 7",
    "Address": "6931 Ash Street",
    "loc": [
      -96.8257693,
      33.1474141
    ],
    "Active": "14-Jan-94",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480850009",
    "siteID": "48_085_0009",
    "CAMS": "1010",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Frisco Eubanks",
    "Address": "6601 Eubanks",
    "loc": [
      -96.8288087,
      33.1446618
    ],
    "Active": "15-Jan-95",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480850029",
    "siteID": "48_085_0029",
    "CAMS": "",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Frisco Stonebrook",
    "Address": "7202 Stonebrook Parkway",
    "loc": [
      -96.8244725,
      33.1360249
    ],
    "Active": "7-Jan-11",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "480910503",
    "siteID": "48_091_0503",
    "CAMS": "503",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Bulverde Elementary",
    "Address": "1715 E Ammann Road",
    "loc": [
      -98.4627778,
      29.7608333
    ],
    "Active": "27-Aug-02",
    "Deactive": "",
    "Owner": "Alamo Area Council of Governments"
  },
  {
    "AQS_Code": "480910505",
    "siteID": "48_091_0505",
    "CAMS": "505",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "City of Garden Ridge",
    "Address": "21340 FM 3009",
    "loc": [
      -98.2986111,
      29.6391667
    ],
    "Active": "25-Mar-03",
    "Deactive": "",
    "Owner": "Alamo Area Council of Governments"
  },
  {
    "AQS_Code": "480971504",
    "siteID": "48_097_1504",
    "CAMS": "1504",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Gainesville Doss Street",
    "Address": "1112 Doss Street",
    "loc": [
      -97.153805,
      33.63317
    ],
    "Active": "1-Oct-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "481095018",
    "siteID": "48_109_5018",
    "CAMS": "5018",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Guadalupe Pass KGDP",
    "Address": "Pine Springs",
    "loc": [
      -104.814444,
      31.831111
    ],
    "Active": "1-Aug-05",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "481130018",
    "siteID": "48_113_0018",
    "CAMS": "",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Morrell",
    "Address": "3049 Morrell",
    "loc": [
      -96.7818829,
      32.744981
    ],
    "Active": "1-Jan-69",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481130050",
    "siteID": "48_113_0050",
    "CAMS": "312",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Convention Center",
    "Address": "717 South Akard",
    "loc": [
      -96.7976859,
      32.7742622
    ],
    "Active": "1-Jan-79",
    "Deactive": "",
    "Owner": "City of Dallas Air Pollution Control Section"
  },
  {
    "AQS_Code": "481130061",
    "siteID": "48_113_0061",
    "CAMS": "",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Earhart",
    "Address": "3434 Bickers (Earhart Elem School)",
    "loc": [
      -96.8765711,
      32.7853591
    ],
    "Active": "1-Jan-09",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481130069",
    "siteID": "48_113_0069",
    "CAMS": "0060, 0161, 0401, 3002 ",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Dallas Hinton",
    "Address": "1415 Hinton Street",
    "loc": [
      -96.8601165,
      32.8200608
    ],
    "Active": "1-Jan-86",
    "Deactive": "",
    "Owner": "City of Dallas Air Pollution Control Section"
  },
  {
    "AQS_Code": "481130075",
    "siteID": "48_113_0075",
    "CAMS": "0063, 0679 ",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Dallas North #2",
    "Address": "12532 1/2 Nuestra Drive",
    "loc": [
      -96.8084975,
      32.9192056
    ],
    "Active": "2-Nov-98",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481130087",
    "siteID": "48_113_0087",
    "CAMS": "402",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Dallas Redbird Airport Executive",
    "Address": "3277 W Redbird Lane",
    "loc": [
      -96.8720596,
      32.6764506
    ],
    "Active": "1-Jan-95",
    "Deactive": "",
    "Owner": "City of Dallas Air Pollution Control Section"
  },
  {
    "AQS_Code": "481131067",
    "siteID": "48_113_1067",
    "CAMS": "1067",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Dallas LBJ Freeway",
    "Address": "8652 LBJ Freeway",
    "loc": [
      -96.75355,
      32.92118
    ],
    "Active": "1-Apr-14",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481131500",
    "siteID": "48_113_1500",
    "CAMS": "1500",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Lancaster Cedardale",
    "Address": "1930 Cedardale Road",
    "loc": [
      -96.800599,
      32.630011
    ],
    "Active": "1-Sep-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "481131505",
    "siteID": "48_113_1505",
    "CAMS": "1505",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Dallas Elm Fork",
    "Address": "2171 Manana Drive",
    "loc": [
      -96.913552,
      32.879107
    ],
    "Active": "18-Nov-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "481210034",
    "siteID": "48_121_0034",
    "CAMS": "0056, 0157, 0163 ",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Denton Airport South",
    "Address": "Denton Airport South",
    "loc": [
      -97.1962836,
      33.219069
    ],
    "Active": "16-Feb-98",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481211007",
    "siteID": "48_121_1007",
    "CAMS": "1007",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Flower Mound Shiloh",
    "Address": "4401 Shiloh Road",
    "loc": [
      -97.1300022,
      33.0458619
    ],
    "Active": "27-Oct-10",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "481211013",
    "siteID": "48_121_1013",
    "CAMS": "1013",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "DISH Airfield",
    "Address": "9800 Clark Airport Road",
    "loc": [
      -97.29765,
      33.13093
    ],
    "Active": "31-Mar-10",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "481211032",
    "siteID": "48_121_1032",
    "CAMS": "1032",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Pilot Point",
    "Address": "792 E Northside Dr",
    "loc": [
      -96.9445903,
      33.4106476
    ],
    "Active": "4-Apr-06",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481215008",
    "siteID": "48_121_5008",
    "CAMS": "5008",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Denton Airport KDTO",
    "Address": "Denton Municipal Airport",
    "loc": [
      -97.198889,
      33.206111
    ],
    "Active": "22-Jan-03",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "481231602",
    "siteID": "48_123_1602",
    "CAMS": "1602",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Cuero",
    "Address": "40 Cooperative Way",
    "loc": [
      -97.276575,
      29.134779
    ],
    "Active": "15-Apr-14",
    "Deactive": "",
    "Owner": "City of Victoria"
  },
  {
    "AQS_Code": "481350003",
    "siteID": "48_135_0003",
    "CAMS": "0047, 0122 ",
    "TCEQRegion": "MIDLAND",
    "Region": "7",
    "Name": "Odessa-Hays Elementary School",
    "Address": "Barrett & Monahans Streets",
    "loc": [
      -102.3420368,
      31.8365747
    ],
    "Active": "2-Feb-93",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481351014",
    "siteID": "48_135_1014",
    "CAMS": "1014",
    "TCEQRegion": "MIDLAND",
    "Region": "7",
    "Name": "Odessa Gonzales",
    "Address": "2700 Disney",
    "loc": [
      -102.3347563,
      31.8702534
    ],
    "Active": "6-Jun-02",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481390016",
    "siteID": "48_139_0016",
    "CAMS": "0052, 0137 ",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Midlothian OFW",
    "Address": "2725 Old Fort Worth Road",
    "loc": [
      -97.0268987,
      32.4820829
    ],
    "Active": "7-Nov-94",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481391044",
    "siteID": "48_139_1044",
    "CAMS": "1044",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Italy",
    "Address": "900 FM 667 Ellis County",
    "loc": [
      -96.8701892,
      32.1754166
    ],
    "Active": "21-Aug-07",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481410029",
    "siteID": "48_141_0029",
    "CAMS": "414",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Ivanhoe",
    "Address": "10834 Ivanhoe (Ivanhoe Fire Station)",
    "loc": [
      -106.3235781,
      31.7857687
    ],
    "Active": "1-Jan-79",
    "Deactive": "",
    "Owner": "City of El Paso Environmental Services Department"
  },
  {
    "AQS_Code": "481410037",
    "siteID": "48_141_0037",
    "CAMS": "0012, 0125, 0151 ",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "El Paso UTEP",
    "Address": "250 Rim Rd",
    "loc": [
      -106.5012595,
      31.7682914
    ],
    "Active": "1-Jan-81",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481410038",
    "siteID": "48_141_0038",
    "CAMS": "",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Riverside",
    "Address": "301 Midway Dr (Riverside High School)",
    "loc": [
      -106.3721,
      31.7338
    ],
    "Active": "1-Jan-81",
    "Deactive": "",
    "Owner": "City of El Paso Environmental Services Department"
  },
  {
    "AQS_Code": "481410044",
    "siteID": "48_141_0044",
    "CAMS": "0041, 0126, 3001 ",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "El Paso Chamizal",
    "Address": "800 S San Marcial Street",
    "loc": [
      -106.4552272,
      31.7656854
    ],
    "Active": "1-Apr-88",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481410047",
    "siteID": "48_141_0047",
    "CAMS": "123",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Womble",
    "Address": "Cleveland Ave at Clark Dr",
    "loc": [
      -106.4131769,
      31.7759422
    ],
    "Active": "13-Apr-93",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481410054",
    "siteID": "48_141_0054",
    "CAMS": "36",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "El Paso Lower Valley",
    "Address": "8470 Plant Rd",
    "loc": [
      -106.356022,
      31.7038461
    ],
    "Active": "7-Jun-96",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481410055",
    "siteID": "48_141_0055",
    "CAMS": "0037, 0159, 0172 ",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Ascarate Park SE",
    "Address": "650 R E Thomason Loop",
    "loc": [
      -106.4028059,
      31.7467753
    ],
    "Active": "1-Sep-99",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481410057",
    "siteID": "48_141_0057",
    "CAMS": "49",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Socorro Hueco",
    "Address": "320 Old Hueco Tanks Road",
    "loc": [
      -106.288,
      31.6675
    ],
    "Active": "18-Nov-99",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481410058",
    "siteID": "48_141_0058",
    "CAMS": "72",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Skyline Park",
    "Address": "5050A Yvette Drive",
    "loc": [
      -106.425827,
      31.8939133
    ],
    "Active": "11-Jul-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481410693",
    "siteID": "48_141_0693",
    "CAMS": "693",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Van Buren",
    "Address": "2700 Harrison Avenue",
    "loc": [
      -106.46452,
      31.81337
    ],
    "Active": "5-Jul-10",
    "Deactive": "",
    "Owner": "EPA/OAQPS/MQAG"
  },
  {
    "AQS_Code": "481411021",
    "siteID": "48_141_1021",
    "CAMS": "1021",
    "TCEQRegion": "EL PASO",
    "Region": "6",
    "Name": "Ojo De Agua",
    "Address": "6767 Ojo De Agua",
    "loc": [
      -106.5473,
      31.86247
    ],
    "Active": "15-Apr-13",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481490001",
    "siteID": "48_149_0001",
    "CAMS": "601",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Fayette County",
    "Address": "636 Roznov Rd",
    "loc": [
      -96.7458748,
      29.9624745
    ],
    "Active": "18-May-00",
    "Deactive": "",
    "Owner": "Capitol Area Council of Governments"
  },
  {
    "AQS_Code": "481570696",
    "siteID": "48_157_0696",
    "CAMS": "696",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "UH Sugarland",
    "Address": "14000 University Blvd",
    "loc": [
      -95.6497,
      29.5741
    ],
    "Active": "26-Feb-09",
    "Deactive": "",
    "Owner": "University of Houston"
  },
  {
    "AQS_Code": "481670004",
    "siteID": "48_167_0004",
    "CAMS": "",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Texas City Fire Station",
    "Address": "2516 Texas Avenue",
    "loc": [
      -94.930833,
      29.384444
    ],
    "Active": "1-Jan-72",
    "Deactive": "",
    "Owner": "Galveston City-County Health Department"
  },
  {
    "AQS_Code": "481670005",
    "siteID": "48_167_0005",
    "CAMS": "0147, 1022 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Texas City Ball Park",
    "Address": "2516 1/2 Texas Avenue",
    "loc": [
      -94.9315197,
      29.3852338
    ],
    "Active": "20-Oct-97",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481670056",
    "siteID": "48_167_0056",
    "CAMS": "620",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Texas City 34th Street",
    "Address": "2212 North 34th Street",
    "loc": [
      -94.94712,
      29.4057
    ],
    "Active": "1-Jun-03",
    "Deactive": "",
    "Owner": "Texas City Industry Group"
  },
  {
    "AQS_Code": "481670571",
    "siteID": "48_167_0571",
    "CAMS": "571",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Clear Creek High School",
    "Address": "2305 E Main St",
    "loc": [
      -95.070556,
      29.525556
    ],
    "Active": "12-Sep-03",
    "Deactive": "",
    "Owner": "University of Houston"
  },
  {
    "AQS_Code": "481670615",
    "siteID": "48_167_0615",
    "CAMS": "0615, 1615 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Texas City BP 31st Street (Site 1)",
    "Address": "Texas City Bp Property",
    "loc": [
      -94.94108,
      29.38145
    ],
    "Active": "31-Dec-09",
    "Deactive": "",
    "Owner": "British Petroleum"
  },
  {
    "AQS_Code": "481670616",
    "siteID": "48_167_0616",
    "CAMS": "0616, 1616 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Texas City BP Onsite (Site 2)",
    "Address": "Texas City Bp Property Onsite",
    "loc": [
      -94.91544,
      29.36886
    ],
    "Active": "23-Mar-10",
    "Deactive": "",
    "Owner": "British Petroleum"
  },
  {
    "AQS_Code": "481670621",
    "siteID": "48_167_0621",
    "CAMS": "0621, 1621 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Texas City BP Logan Street (Site 3)",
    "Address": "303 Logan Street",
    "loc": [
      -94.93022,
      29.380981
    ],
    "Active": "7-Apr-10",
    "Deactive": "",
    "Owner": "British Petroleum"
  },
  {
    "AQS_Code": "481670683",
    "siteID": "48_167_0683",
    "CAMS": "683",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Texas City 11th Street",
    "Address": "569 11th Street South",
    "loc": [
      -94.91019,
      29.3787
    ],
    "Active": "1-Jan-10",
    "Deactive": "",
    "Owner": "Marathon Petroleum Co."
  },
  {
    "AQS_Code": "481670697",
    "siteID": "48_167_0697",
    "CAMS": "697",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "UH Coastal Center",
    "Address": "Jack Brooks Road",
    "loc": [
      -95.0414,
      29.3879
    ],
    "Active": "31-Mar-10",
    "Deactive": "",
    "Owner": "University of Houston"
  },
  {
    "AQS_Code": "481671034",
    "siteID": "48_167_1034",
    "CAMS": "1034",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Galveston 99th Street",
    "Address": "9511 Avenue V 1/2",
    "loc": [
      -94.8612886,
      29.2544736
    ],
    "Active": "20-Mar-07",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481675005",
    "siteID": "48_167_5005",
    "CAMS": "5005",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Galveston Airport KGLS",
    "Address": "Galveston Scholes International Airport",
    "loc": [
      -94.864167,
      29.270278
    ],
    "Active": "22-Jan-03",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "481750624",
    "siteID": "48_175_0624",
    "CAMS": "624",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Coleto",
    "Address": "Coleto",
    "loc": [
      -97.220882,
      28.720926
    ],
    "Active": "10-Jul-10",
    "Deactive": "",
    "Owner": "City of Victoria"
  },
  {
    "AQS_Code": "481830001",
    "siteID": "48_183_0001",
    "CAMS": "0019, 0127, 0644 ",
    "TCEQRegion": "TYLER",
    "Region": "5",
    "Name": "Longview",
    "Address": "Gregg Co Airport near Longview",
    "loc": [
      -94.7118107,
      32.3786823
    ],
    "Active": "1-Jan-77",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "481870504",
    "siteID": "48_187_0504",
    "CAMS": "504",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "New Braunfels Airport",
    "Address": "2090 Airport Rd",
    "loc": [
      -98.0288889,
      29.7041667
    ],
    "Active": "30-Aug-02",
    "Deactive": "",
    "Owner": "Alamo Area Council of Governments"
  },
  {
    "AQS_Code": "481870506",
    "siteID": "48_187_0506",
    "CAMS": "506",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Seguin Outdoor Learning Center",
    "Address": "1865 Hwy 90 East",
    "loc": [
      -97.932222,
      29.588611
    ],
    "Active": "26-Mar-03",
    "Deactive": "",
    "Owner": "Alamo Area Council of Governments"
  },
  {
    "AQS_Code": "481875004",
    "siteID": "48_187_5004",
    "CAMS": "5004",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "New Braunfels Airport KBAZ",
    "Address": "New Braunfels Municipal Airport",
    "loc": [
      -98.0452778,
      29.7086111
    ],
    "Active": "22-Jan-03",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "482010024",
    "siteID": "48_201_0024",
    "CAMS": "0008, 0108, 0150 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston Aldine",
    "Address": "4510 1/2 Aldine Mail Rd",
    "loc": [
      -95.3261373,
      29.9010364
    ],
    "Active": "1-Jan-74",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010026",
    "siteID": "48_201_0026",
    "CAMS": "0015, 0115 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Channelview",
    "Address": "1405 Sheldon Road",
    "loc": [
      -95.1254948,
      29.8027073
    ],
    "Active": "1-Jan-80",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010029",
    "siteID": "48_201_0029",
    "CAMS": "0026, 0110, 0154 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Northwest Harris County",
    "Address": "16822 Kitzman",
    "loc": [
      -95.6739508,
      30.039524
    ],
    "Active": "1-Jan-81",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010036",
    "siteID": "48_201_0036",
    "CAMS": "1036",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Jacinto Port",
    "Address": "Corner of First & Elsbeth Streets",
    "loc": [
      -95.1051,
      29.7761
    ],
    "Active": "19-Jul-06",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010046",
    "siteID": "48_201_0046",
    "CAMS": "405",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston North Wayside",
    "Address": "7330 1/2 North Wayside",
    "loc": [
      -95.2840958,
      29.8280859
    ],
    "Active": "1-Jan-76",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482010047",
    "siteID": "48_201_0047",
    "CAMS": "408",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Lang",
    "Address": "4401 1/2 Lang Rd",
    "loc": [
      -95.489167,
      29.834167
    ],
    "Active": "1-Jan-78",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482010051",
    "siteID": "48_201_0051",
    "CAMS": "409",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston Croquet",
    "Address": "13826 1/2 Croquet",
    "loc": [
      -95.474167,
      29.623889
    ],
    "Active": "1-Jan-78",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482010055",
    "siteID": "48_201_0055",
    "CAMS": "0053, 0146, 0181 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston Bayland Park",
    "Address": "6400 Bissonnet Street",
    "loc": [
      -95.499219,
      29.6957294
    ],
    "Active": "24-Mar-98",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010057",
    "siteID": "48_201_0057",
    "CAMS": "0167, 1667 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Galena Park",
    "Address": "1713 2nd Street",
    "loc": [
      -95.238469,
      29.734231
    ],
    "Active": "21-Oct-97",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010058",
    "siteID": "48_201_0058",
    "CAMS": "148",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Baytown",
    "Address": "7210 1/2 Bayway Drive",
    "loc": [
      -95.0312316,
      29.7706975
    ],
    "Active": "25-Mar-98",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010060",
    "siteID": "48_201_0060",
    "CAMS": "404",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston Kirkpatrick",
    "Address": "5565 Kirkpatrick",
    "loc": [
      -95.2936223,
      29.8074146
    ],
    "Active": "10-Feb-00",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482010061",
    "siteID": "48_201_0061",
    "CAMS": "145",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Shore Acres",
    "Address": "3903 1/2 Old Highway 146",
    "loc": [
      -95.0181324,
      29.6150008
    ],
    "Active": "28-May-98",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010062",
    "siteID": "48_201_0062",
    "CAMS": "406",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston Monroe",
    "Address": "9726 1/2 Monroe",
    "loc": [
      -95.267222,
      29.625556
    ],
    "Active": "1-Jan-84",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482010066",
    "siteID": "48_201_0066",
    "CAMS": "410",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston Westhollow",
    "Address": "3333 1/2 Hwy 6 South",
    "loc": [
      -95.635833,
      29.723333
    ],
    "Active": "1-Jul-94",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482010069",
    "siteID": "48_201_0069",
    "CAMS": "169",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Milby Park",
    "Address": "2201A Central St",
    "loc": [
      -95.2611301,
      29.7062492
    ],
    "Active": "7-Apr-99",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010071",
    "siteID": "48_201_0071",
    "CAMS": "",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Pasadena HL&P",
    "Address": "1001 1/2 Red Bluff",
    "loc": [
      -95.2013298,
      29.7164829
    ],
    "Active": "17-Jul-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010075",
    "siteID": "48_201_0075",
    "CAMS": "411",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston Texas Avenue",
    "Address": "2311 Texas Ave",
    "loc": [
      -95.350278,
      29.752778
    ],
    "Active": "30-Mar-01",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482010307",
    "siteID": "48_201_0307",
    "CAMS": "1029",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Manchester/Central",
    "Address": "9401 1/2 Manchester Street",
    "loc": [
      -95.2599093,
      29.718799
    ],
    "Active": "9-May-05",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482010416",
    "siteID": "48_201_0416",
    "CAMS": "416",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Park Place",
    "Address": "7421 Park Place Blvd",
    "loc": [
      -95.294722,
      29.686389
    ],
    "Active": "22-Feb-06",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482010551",
    "siteID": "48_201_0551",
    "CAMS": "551",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Sheldon",
    "Address": "15345 Beaumont Hwy",
    "loc": [
      -95.1602778,
      29.8586111
    ],
    "Active": "17-Apr-02",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010552",
    "siteID": "48_201_0552",
    "CAMS": "552",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Baytown Wetlands Center",
    "Address": "1724 Market Street",
    "loc": [
      -94.9847222,
      29.7330556
    ],
    "Active": "11-Jun-03",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010553",
    "siteID": "48_201_0553",
    "CAMS": "553",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Crosby Library",
    "Address": "1800 N. 18th Street",
    "loc": [
      -95.0683333,
      29.9208333
    ],
    "Active": "16-Jun-03",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010554",
    "siteID": "48_201_0554",
    "CAMS": "554",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "West Houston",
    "Address": "16719 Clay Road",
    "loc": [
      -95.6569444,
      29.8330556
    ],
    "Active": "24-Dec-03",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010556",
    "siteID": "48_201_0556",
    "CAMS": "556",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "La Porte Sylvan Beach",
    "Address": "636 Bayshore Drive",
    "loc": [
      -95.0097222,
      29.6552778
    ],
    "Active": "1-Jan-04",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010557",
    "siteID": "48_201_0557",
    "CAMS": "557",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Mercer Arboretum",
    "Address": "22306 Aldine Westfield Road",
    "loc": [
      -95.3811111,
      30.0380556
    ],
    "Active": "12-Feb-04",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010558",
    "siteID": "48_201_0558",
    "CAMS": "558",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Tom Bass",
    "Address": "15108 Cullen Blvd",
    "loc": [
      -95.3536111,
      29.5894444
    ],
    "Active": "6-Feb-04",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010559",
    "siteID": "48_201_0559",
    "CAMS": "559",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Katy Park",
    "Address": "24927 Morton Road",
    "loc": [
      -95.8061111,
      29.8105556
    ],
    "Active": "12-Mar-04",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010560",
    "siteID": "48_201_0560",
    "CAMS": "560",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Atascocita",
    "Address": "2302 Atascocita Rd",
    "loc": [
      -95.235,
      29.961944
    ],
    "Active": "29-Jul-04",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010561",
    "siteID": "48_201_0561",
    "CAMS": "561",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Meyer Park",
    "Address": "7700 Cypresswood Dr",
    "loc": [
      -95.5225,
      30.011667
    ],
    "Active": "30-Jul-04",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010562",
    "siteID": "48_201_0562",
    "CAMS": "562",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Bunker Hill Village",
    "Address": "11977 Memorial Drive",
    "loc": [
      -95.538056,
      29.778333
    ],
    "Active": "8-Oct-04",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010563",
    "siteID": "48_201_0563",
    "CAMS": "563",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Huffman Wolf Road",
    "Address": "2100 Wolf Road",
    "loc": [
      -95.06147,
      30.05786
    ],
    "Active": "21-Sep-10",
    "Deactive": "",
    "Owner": "Harris County Health and Environmental Services"
  },
  {
    "AQS_Code": "482010570",
    "siteID": "48_201_0570",
    "CAMS": "570",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Clear Brook High School",
    "Address": "4607 FM 2351",
    "loc": [
      -95.1852778,
      29.5488889
    ],
    "Active": "12-Sep-03",
    "Deactive": "",
    "Owner": "University of Houston"
  },
  {
    "AQS_Code": "482010572",
    "siteID": "48_201_0572",
    "CAMS": "572",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Clear Lake High School",
    "Address": "2929 Bay Area Blvd",
    "loc": [
      -95.105,
      29.583333
    ],
    "Active": "12-Sep-03",
    "Deactive": "",
    "Owner": "University of Houston"
  },
  {
    "AQS_Code": "482010617",
    "siteID": "48_201_0617",
    "CAMS": "617",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Wallisville Road",
    "Address": "4727 Wallisville Road",
    "loc": [
      -94.99,
      29.821389
    ],
    "Active": "30-May-03",
    "Deactive": "",
    "Owner": "Houston Regional Monitoring"
  },
  {
    "AQS_Code": "482010669",
    "siteID": "48_201_0669",
    "CAMS": "669",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "TPC FTIR South",
    "Address": "8600 Park Place Blvd",
    "loc": [
      -95.252778,
      29.694722
    ],
    "Active": "13-Jan-06",
    "Deactive": "",
    "Owner": "Texas Petrochemicals"
  },
  {
    "AQS_Code": "482010670",
    "siteID": "48_201_0670",
    "CAMS": "670",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "TPC FTIR North",
    "Address": "8600 Park Place Blvd",
    "loc": [
      -95.257222,
      29.701944
    ],
    "Active": "1-Jan-06",
    "Deactive": "",
    "Owner": "Texas Petrochemicals"
  },
  {
    "AQS_Code": "482010671",
    "siteID": "48_201_0671",
    "CAMS": "671",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Goodyear GC",
    "Address": "9728 West Road",
    "loc": [
      -95.255,
      29.706111
    ],
    "Active": "4-May-06",
    "Deactive": "",
    "Owner": "Goodyear Tire & Rubber Co"
  },
  {
    "AQS_Code": "482010673",
    "siteID": "48_201_0673",
    "CAMS": "673",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Goodyear Houston Site #2",
    "Address": "2000 Goodyear Dr",
    "loc": [
      -95.256697,
      29.7023
    ],
    "Active": "1-Oct-06",
    "Deactive": "",
    "Owner": "Goodyear Tire & Rubber Co"
  },
  {
    "AQS_Code": "482010695",
    "siteID": "48_201_0695",
    "CAMS": "695",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "UH Moody Tower",
    "Address": "4401 Wheeler Street",
    "loc": [
      -95.3414,
      29.7176
    ],
    "Active": "31-Mar-10",
    "Deactive": "",
    "Owner": "University of Houston"
  },
  {
    "AQS_Code": "482010803",
    "siteID": "48_201_0803",
    "CAMS": "0114, 0603 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "HRM #3 Haden Rd",
    "Address": "1504 1/2 Haden Road",
    "loc": [
      -95.1785379,
      29.7647877
    ],
    "Active": "14-Nov-92",
    "Deactive": "",
    "Owner": "Houston Regional Monitoring"
  },
  {
    "AQS_Code": "482011015",
    "siteID": "48_201_1015",
    "CAMS": "0165, 1015 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Lynchburg Ferry",
    "Address": "4407 Independence Parkway South",
    "loc": [
      -95.0813861,
      29.7616528
    ],
    "Active": "24-Apr-03",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482011017",
    "siteID": "48_201_1017",
    "CAMS": "1017",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Baytown Garth",
    "Address": "8622 Garth Road Unit A",
    "loc": [
      -94.983786,
      29.823319
    ],
    "Active": "5-Jun-12",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482011034",
    "siteID": "48_201_1034",
    "CAMS": "1",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston East",
    "Address": "1262 1/2 Mae Drive",
    "loc": [
      -95.2205822,
      29.7679965
    ],
    "Active": "1-Jan-73",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482011035",
    "siteID": "48_201_1035",
    "CAMS": "0055, 0113, 0304, 0403 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Clinton",
    "Address": "9525 1/2 Clinton Dr",
    "loc": [
      -95.2575931,
      29.7337263
    ],
    "Active": "1-Jan-72",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482011039",
    "siteID": "48_201_1039",
    "CAMS": "0035, 0139, 0235, 1001, 3000 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston Deer Park #2",
    "Address": "4514 1/2 Durant St",
    "loc": [
      -95.1285077,
      29.670025
    ],
    "Active": "22-Oct-96",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482011042",
    "siteID": "48_201_1042",
    "CAMS": "309",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Kingwood",
    "Address": "3603 1/2 West Lake Houston Pkwy",
    "loc": [
      -95.1897514,
      30.0584604
    ],
    "Active": "15-Feb-01",
    "Deactive": "",
    "Owner": "City of Houston Health Department"
  },
  {
    "AQS_Code": "482011043",
    "siteID": "48_201_1043",
    "CAMS": "243",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "La Porte Airport C243",
    "Address": "La Porte Airport 2434 Buchanan Street",
    "loc": [
      -95.0647,
      29.672
    ],
    "Active": "9-Jun-05",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482011049",
    "siteID": "48_201_1049",
    "CAMS": "1049",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Pasadena North",
    "Address": "702 Light Co Service Road",
    "loc": [
      -95.2224669,
      29.716611
    ],
    "Active": "1-Jul-08",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482011050",
    "siteID": "48_201_1050",
    "CAMS": "45",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Seabrook Friendship Park",
    "Address": "4522 Park Rd",
    "loc": [
      -95.0155437,
      29.5830473
    ],
    "Active": "29-Jul-01",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482011052",
    "siteID": "48_201_1052",
    "CAMS": "1052",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston North Loop",
    "Address": "822 North Loop",
    "loc": [
      -95.38769,
      29.81453
    ],
    "Active": "15-Apr-15",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482011066",
    "siteID": "48_201_1066",
    "CAMS": "1066",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Houston Southwest Freeway",
    "Address": "5617 Westward Avenue",
    "loc": [
      -95.49265,
      29.7216
    ],
    "Active": "22-Jan-14",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482016000",
    "siteID": "48_201_6000",
    "CAMS": "0175, 1020 ",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Cesar Chavez",
    "Address": "4829 A Galveston Rd",
    "loc": [
      -95.2535982,
      29.6843603
    ],
    "Active": "11-Mar-04",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482030002",
    "siteID": "48_203_0002",
    "CAMS": "85",
    "TCEQRegion": "TYLER",
    "Region": "5",
    "Name": "Karnack",
    "Address": "Hwy 134 & Spur 449",
    "loc": [
      -94.1674569,
      32.6689873
    ],
    "Active": "30-Jun-01",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482090614",
    "siteID": "48_209_0614",
    "CAMS": "614",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Dripping Springs School",
    "Address": "29400 Ranch Road 12",
    "loc": [
      -98.0833473,
      30.2146162
    ],
    "Active": "11-Mar-03",
    "Deactive": "",
    "Owner": "Capitol Area Council of Governments"
  },
  {
    "AQS_Code": "482091675",
    "siteID": "48_209_1675",
    "CAMS": "1675",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "CAPCOG San Marcos Staples Road",
    "Address": "599 Staples Road",
    "loc": [
      -97.928856,
      29.862281
    ],
    "Active": "20-Sep-11",
    "Deactive": "",
    "Owner": "Capitol Area Council of Governments"
  },
  {
    "AQS_Code": "482150043",
    "siteID": "48_215_0043",
    "CAMS": "0043, 0143 ",
    "TCEQRegion": "HARLINGEN",
    "Region": "15",
    "Name": "Mission",
    "Address": "2300 North Glasscock",
    "loc": [
      -98.291069,
      26.2262097
    ],
    "Active": "1-Jul-95",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482210001",
    "siteID": "48_221_0001",
    "CAMS": "0073, 0681 ",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Granbury",
    "Address": "200 N Gordon Street",
    "loc": [
      -97.8035291,
      32.4423044
    ],
    "Active": "9-May-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482311006",
    "siteID": "48_231_1006",
    "CAMS": "0198, 1006 ",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Greenville",
    "Address": "824 Sayle Street",
    "loc": [
      -96.1155717,
      33.1530882
    ],
    "Active": "20-Mar-03",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482450009",
    "siteID": "48_245_0009",
    "CAMS": "0002, 0112, 2002 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Beaumont Downtown",
    "Address": "1086 Vermont Avenue",
    "loc": [
      -94.0710606,
      30.0364221
    ],
    "Active": "1-Jan-80",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482450011",
    "siteID": "48_245_0011",
    "CAMS": "0028, 0128, 0228 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Port Arthur West",
    "Address": "623 Ellias Street",
    "loc": [
      -93.9910842,
      29.8975163
    ],
    "Active": "1-Jan-81",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482450014",
    "siteID": "48_245_0014",
    "CAMS": "119",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Groves",
    "Address": "3355 Grandview Ave & 32nd St",
    "loc": [
      -93.895928,
      29.9611242
    ],
    "Active": "1-Sep-93",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482450017",
    "siteID": "48_245_0017",
    "CAMS": "136",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Port Neches Avenue L",
    "Address": "605 Avenue L",
    "loc": [
      -93.9528657,
      29.9825311
    ],
    "Active": "25-Jul-94",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482450018",
    "siteID": "48_245_0018",
    "CAMS": "1019, 2001 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Jefferson County Airport",
    "Address": "End of 90th Street @ Jefferson County Airport",
    "loc": [
      -94.00077,
      29.9427981
    ],
    "Active": "1-Oct-94",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482450019",
    "siteID": "48_245_0019",
    "CAMS": "0131, 2000 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "City Service Center / PA",
    "Address": "201 H O Mills Blvd",
    "loc": [
      -93.9792618,
      29.8938491
    ],
    "Active": "9-May-97",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482450021",
    "siteID": "48_245_0021",
    "CAMS": "0303, 0689 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Port Arthur Memorial School",
    "Address": "2200 Jefferson Drive",
    "loc": [
      -93.9090184,
      29.9228943
    ],
    "Active": "6-Mar-00",
    "Deactive": "",
    "Owner": "South East Texas Regional Planning Commission"
  },
  {
    "AQS_Code": "482450022",
    "siteID": "48_245_0022",
    "CAMS": "0064, 0654 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Hamshire",
    "Address": "12552 Second St",
    "loc": [
      -94.3178017,
      29.8639574
    ],
    "Active": "10-Feb-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482450101",
    "siteID": "48_245_0101",
    "CAMS": "0640, 1654 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "SETRPC 40 Sabine Pass",
    "Address": "5200 Mechanic",
    "loc": [
      -93.8940805,
      29.7279314
    ],
    "Active": "1-Jan-00",
    "Deactive": "",
    "Owner": "South East Texas Regional Planning Commission"
  },
  {
    "AQS_Code": "482450102",
    "siteID": "48_245_0102",
    "CAMS": "643",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "SETRPC 43 Jefferson Co Airport",
    "Address": "Jefferson County Airport",
    "loc": [
      -94.0006841,
      29.9427514
    ],
    "Active": "5-Aug-08",
    "Deactive": "",
    "Owner": "South East Texas Regional Planning Commission"
  },
  {
    "AQS_Code": "482450628",
    "siteID": "48_245_0628",
    "CAMS": "0628, 1628, 628 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "SETRPC Port Arthur",
    "Address": "Unavailable",
    "loc": [
      -93.951163,
      29.867756
    ],
    "Active": "5-Oct-04",
    "Deactive": "",
    "Owner": "South East Texas Regional Planning Commission"
  },
  {
    "AQS_Code": "482451035",
    "siteID": "48_245_1035",
    "CAMS": "1035",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Nederland High School",
    "Address": "1800 N. 18th Street",
    "loc": [
      -94.0108717,
      29.9789255
    ],
    "Active": "30-Aug-06",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482451050",
    "siteID": "48_245_1050",
    "CAMS": "1050",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "Beaumont Mary",
    "Address": "414 Mary Street",
    "loc": [
      -94.0909236,
      30.0671163
    ],
    "Active": "13-Oct-10",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482510003",
    "siteID": "48_251_0003",
    "CAMS": "0077, 0682 ",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Cleburne Airport",
    "Address": "1650 Airport Drive",
    "loc": [
      -97.4367419,
      32.3535945
    ],
    "Active": "10-May-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482511008",
    "siteID": "48_251_1008",
    "CAMS": "1008",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Johnson County Luisa",
    "Address": "2420 Luisa Ln",
    "loc": [
      -97.169271,
      32.469701
    ],
    "Active": "23-Nov-10",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482511063",
    "siteID": "48_251_1063",
    "CAMS": "1063",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Mansfield Flying L Lane",
    "Address": "1310 Flying L Lane",
    "loc": [
      -97.1175,
      32.5418
    ],
    "Active": "1-Oct-12",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "482511501",
    "siteID": "48_251_1501",
    "CAMS": "1501",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Godley FM2331",
    "Address": "12404 FM2331",
    "loc": [
      -97.526759,
      32.481821
    ],
    "Active": "13-Jul-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "482551070",
    "siteID": "48_255_1070",
    "CAMS": "1070",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Karnes County Courthouse",
    "Address": "210 W. Calvert Avenue",
    "loc": [
      -97.901742,
      28.885481
    ],
    "Active": "17-Dec-14",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482570005",
    "siteID": "48_257_0005",
    "CAMS": "71",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Kaufman",
    "Address": "3790 S Houston St",
    "loc": [
      -96.3176873,
      32.5649684
    ],
    "Active": "11-Sep-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482570020",
    "siteID": "48_257_0020",
    "CAMS": "",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Terrell Temtex",
    "Address": "2988 Temtex Blvd",
    "loc": [
      -96.317911,
      32.731919
    ],
    "Active": "22-Dec-10",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482730314",
    "siteID": "48_273_0314",
    "CAMS": "314",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "National Seashore",
    "Address": "20420 Park Road",
    "loc": [
      -97.2986922,
      27.4269813
    ],
    "Active": "25-Oct-02",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "482910699",
    "siteID": "48_291_0699",
    "CAMS": "699",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "UH West Liberty",
    "Address": "91 Weldon Texaco Road CR 615/610 N",
    "loc": [
      -94.9781,
      30.0583
    ],
    "Active": "31-Mar-10",
    "Deactive": "",
    "Owner": "University of Houston"
  },
  {
    "AQS_Code": "483091037",
    "siteID": "48_309_1037",
    "CAMS": "1037",
    "TCEQRegion": "WACO",
    "Region": "9",
    "Name": "Waco Mazanec",
    "Address": "4472 Mazanec Rd",
    "loc": [
      -97.0706982,
      31.6530743
    ],
    "Active": "16-Apr-07",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483095010",
    "siteID": "48_309_5010",
    "CAMS": "5010",
    "TCEQRegion": "WACO",
    "Region": "9",
    "Name": "Waco KACT",
    "Address": "Waco Regional Airport",
    "loc": [
      -97.230556,
      31.611389
    ],
    "Active": "2-Sep-05",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "483230004",
    "siteID": "48_323_0004",
    "CAMS": "0319, 0655 ",
    "TCEQRegion": "LAREDO",
    "Region": "16",
    "Name": "Eagle Pass",
    "Address": "265 Foster Maldonado",
    "loc": [
      -100.4511555,
      28.704607
    ],
    "Active": "1-Jun-05",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483371507",
    "siteID": "48_337_1507",
    "CAMS": "1507",
    "TCEQRegion": "ABILENE",
    "Region": "3",
    "Name": "Bowie Patterson Street",
    "Address": "1032 Patterson Street",
    "loc": [
      -97.829658,
      33.55896
    ],
    "Active": "31-Oct-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "483390078",
    "siteID": "48_339_0078",
    "CAMS": "78",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Conroe Relocated",
    "Address": "9472A Hwy 1484",
    "loc": [
      -95.4251278,
      30.3503017
    ],
    "Active": "1-Oct-01",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483390698",
    "siteID": "48_339_0698",
    "CAMS": "698",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "UH WG Jones Forest",
    "Address": "5203 Magnolia Parkway FM 1488",
    "loc": [
      -95.4832,
      30.2362
    ],
    "Active": "31-Mar-10",
    "Deactive": "",
    "Owner": "University of Houston"
  },
  {
    "AQS_Code": "483395006",
    "siteID": "48_339_5006",
    "CAMS": "5006",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Conroe Airport KCXO",
    "Address": "Montgomery County Airport",
    "loc": [
      -95.413889,
      30.356667
    ],
    "Active": "22-Jan-03",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "483491051",
    "siteID": "48_349_1051",
    "CAMS": "1051",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Corsicana Airport",
    "Address": "Corsicana Airport",
    "loc": [
      -96.3991408,
      32.0319335
    ],
    "Active": "16-Jun-09",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483495014",
    "siteID": "48_349_5014",
    "CAMS": "5014",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Corsicana KCRS",
    "Address": "C David Campbell Field-Corsicana Municipal Airport",
    "loc": [
      -96.400556,
      32.028056
    ],
    "Active": "1-Aug-05",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "483550025",
    "siteID": "48_355_0025",
    "CAMS": "4",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Corpus Christi West",
    "Address": "Corpus Christi State School (Airport Rd) 902 AIRPORT BLVD",
    "loc": [
      -97.4342619,
      27.7653399
    ],
    "Active": "1-Jan-81",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483550026",
    "siteID": "48_355_0026",
    "CAMS": "21",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Corpus Christi Tuloso",
    "Address": "9860 La Branch",
    "loc": [
      -97.5553798,
      27.8324089
    ],
    "Active": "1-Jan-84",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483550029",
    "siteID": "48_355_0029",
    "CAMS": "0168, 0170, 0195 ",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Corpus Christi Hillcrest",
    "Address": "1802 Nueces Bay Blvd (Citgo Refinery Co)",
    "loc": [
      -97.419258,
      27.8075444
    ],
    "Active": "1-Nov-94",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483550032",
    "siteID": "48_355_0032",
    "CAMS": "0098, 0149, 0155 ",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Corpus Christi Huisache",
    "Address": "3810 Huisache Street",
    "loc": [
      -97.4315816,
      27.8045054
    ],
    "Active": "6-Aug-97",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483550034",
    "siteID": "48_355_0034",
    "CAMS": "0199, 0635 ",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Dona Park",
    "Address": "5707 Up River Rd",
    "loc": [
      -97.4657031,
      27.8118166
    ],
    "Active": "31-Jan-01",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483550035",
    "siteID": "48_355_0035",
    "CAMS": "634",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Oak Park",
    "Address": "842 Erwin Street",
    "loc": [
      -97.433889,
      27.798889
    ],
    "Active": "2-Dec-04",
    "Deactive": "",
    "Owner": "UTCEER"
  },
  {
    "AQS_Code": "483550036",
    "siteID": "48_355_0036",
    "CAMS": "629",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Port Grain Elevator",
    "Address": "2001B East Navigation Blvd",
    "loc": [
      -97.4197222,
      27.8175
    ],
    "Active": "1-Dec-04",
    "Deactive": "",
    "Owner": "UTCEER"
  },
  {
    "AQS_Code": "483550037",
    "siteID": "48_355_0037",
    "CAMS": "630",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "J.I Hailey",
    "Address": "2702B East Navigation Blvd",
    "loc": [
      -97.4325,
      27.8244444
    ],
    "Active": "30-Nov-04",
    "Deactive": "",
    "Owner": "UTCEER"
  },
  {
    "AQS_Code": "483550039",
    "siteID": "48_355_0039",
    "CAMS": "632",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "FHR Easement",
    "Address": "8401B Up River Road",
    "loc": [
      -97.5288889,
      27.8272222
    ],
    "Active": "29-Nov-04",
    "Deactive": "",
    "Owner": "UTCEER"
  },
  {
    "AQS_Code": "483550041",
    "siteID": "48_355_0041",
    "CAMS": "633",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Solar Estates",
    "Address": "9122 Leopard St",
    "loc": [
      -97.5436111,
      27.8291667
    ],
    "Active": "1-Dec-04",
    "Deactive": "",
    "Owner": "UTCEER"
  },
  {
    "AQS_Code": "483550083",
    "siteID": "48_355_0083",
    "CAMS": "83",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Corpus Christi Palm",
    "Address": "1511 Palm Drive",
    "loc": [
      -97.4198783,
      27.8028877
    ],
    "Active": "18-May-10",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483550660",
    "siteID": "48_355_0660",
    "CAMS": "660",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Holly Road",
    "Address": "4801 Holly Road",
    "loc": [
      -97.3875,
      27.703056
    ],
    "Active": "18-Jan-06",
    "Deactive": "",
    "Owner": "City of Corpus Christi"
  },
  {
    "AQS_Code": "483550664",
    "siteID": "48_355_0664",
    "CAMS": "664",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Violet",
    "Address": "3515 FM 1694",
    "loc": [
      -97.619444,
      27.757778
    ],
    "Active": "12-Jan-06",
    "Deactive": "",
    "Owner": "City of Corpus Christi"
  },
  {
    "AQS_Code": "483551024",
    "siteID": "48_355_1024",
    "CAMS": "1024",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Williams Park",
    "Address": "2518 Dempsey Rd",
    "loc": [
      -97.4137626,
      27.8038056
    ],
    "Active": "8-Aug-05",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483611001",
    "siteID": "48_361_1001",
    "CAMS": "0009, 0141 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "West Orange",
    "Address": "2700 Austin Ave",
    "loc": [
      -93.7613411,
      30.0852629
    ],
    "Active": "1-Jan-74",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483611100",
    "siteID": "48_361_1100",
    "CAMS": "0311, 0642, 0665 ",
    "TCEQRegion": "BEAUMONT",
    "Region": "10",
    "Name": "SETRPC 42 Mauriceville",
    "Address": "Intersection of TX Hwys 62 & 12",
    "loc": [
      -93.8672365,
      30.1945576
    ],
    "Active": "1-Jan-99",
    "Deactive": "",
    "Owner": "South East Texas Regional Planning Commission"
  },
  {
    "AQS_Code": "483631502",
    "siteID": "48_363_1502",
    "CAMS": "1502",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Mineral Wells 23rd Street",
    "Address": "2000 NE 23rd Street",
    "loc": [
      -98.091641,
      32.818671
    ],
    "Active": "21-Aug-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "483670081",
    "siteID": "48_367_0081",
    "CAMS": "76",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Parker County",
    "Address": "3033 New Authon Rd",
    "loc": [
      -97.9059308,
      32.8687727
    ],
    "Active": "26-Jul-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483671506",
    "siteID": "48_367_1506",
    "CAMS": "1506",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Weatherford Highway 180",
    "Address": "2253 Fort Worth Hwy",
    "loc": [
      -97.730285,
      32.758655
    ],
    "Active": "13-Oct-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "483750024",
    "siteID": "48_375_0024",
    "CAMS": "",
    "TCEQRegion": "AMARILLO",
    "Region": "1",
    "Name": "Amarillo SH 136",
    "Address": "7100 State Highway 136",
    "loc": [
      -101.7156402,
      35.2802728
    ],
    "Active": "25-Apr-10",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483750320",
    "siteID": "48_375_0320",
    "CAMS": "320",
    "TCEQRegion": "AMARILLO",
    "Region": "1",
    "Name": "Amarillo A&M",
    "Address": "6500 Amarillo Blvd West",
    "loc": [
      -101.9092746,
      35.2015922
    ],
    "Active": "12-Apr-05",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483751025",
    "siteID": "48_375_1025",
    "CAMS": "1025",
    "TCEQRegion": "AMARILLO",
    "Region": "1",
    "Name": "Amarillo 24th Avenue",
    "Address": "4205 NE 24th Avenue",
    "loc": [
      -101.787405,
      35.236736
    ],
    "Active": "16-Oct-13",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "483970001",
    "siteID": "48_397_0001",
    "CAMS": "69",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Rockwall Heath",
    "Address": "100 E Heath St",
    "loc": [
      -96.4592108,
      32.936523
    ],
    "Active": "8-Aug-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484090659",
    "siteID": "48_409_0659",
    "CAMS": "659",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Aransas Pass",
    "Address": "527 Ransom Rd",
    "loc": [
      -97.148611,
      27.886667
    ],
    "Active": "22-Jan-06",
    "Deactive": "",
    "Owner": "City of Corpus Christi"
  },
  {
    "AQS_Code": "484090685",
    "siteID": "48_409_0685",
    "CAMS": "685",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Ingleside",
    "Address": "San Patricio Municipal Water off Hwy 361",
    "loc": [
      -97.249167,
      27.901667
    ],
    "Active": "29-Jun-07",
    "Deactive": "",
    "Owner": "City of Corpus Christi"
  },
  {
    "AQS_Code": "484090686",
    "siteID": "48_409_0686",
    "CAMS": "686",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Odem-SEP",
    "Address": "San Patricio Municipal Water NW of Corpus",
    "loc": [
      -97.538056,
      27.924722
    ],
    "Active": "11-Dec-06",
    "Deactive": "",
    "Owner": "City of Corpus Christi"
  },
  {
    "AQS_Code": "484090687",
    "siteID": "48_409_0687",
    "CAMS": "687",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Taft-SEP",
    "Address": "San Patricio Municipal Water Dist Pumping Station",
    "loc": [
      -97.408611,
      27.923333
    ],
    "Active": "7-May-07",
    "Deactive": "",
    "Owner": "City of Corpus Christi"
  },
  {
    "AQS_Code": "484230007",
    "siteID": "48_423_0007",
    "CAMS": "82",
    "TCEQRegion": "TYLER",
    "Region": "5",
    "Name": "Tyler Airport Relocated",
    "Address": "14790 County Road 1145",
    "loc": [
      -95.4157515,
      32.3440079
    ],
    "Active": "25-May-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484390075",
    "siteID": "48_439_0075",
    "CAMS": "75",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Eagle Mountain Lake",
    "Address": "14290 Morris Dido Newark Rd",
    "loc": [
      -97.4771754,
      32.9878908
    ],
    "Active": "6-Jun-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484391002",
    "siteID": "48_439_1002",
    "CAMS": "13",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Fort Worth Northwest",
    "Address": "3317 Ross Ave",
    "loc": [
      -97.3565675,
      32.8058183
    ],
    "Active": "1-Jan-75",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484391006",
    "siteID": "48_439_1006",
    "CAMS": "310",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Haws Athletic Center",
    "Address": "600 1/2 Congress St",
    "loc": [
      -97.3423337,
      32.7591432
    ],
    "Active": "1-Apr-01",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484391009",
    "siteID": "48_439_1009",
    "CAMS": "1009",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Everman Johnson Park",
    "Address": "633 Everman Parkway",
    "loc": [
      -97.290353,
      32.621136
    ],
    "Active": "28-Jun-11",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "484391018",
    "siteID": "48_439_1018",
    "CAMS": "1018",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Arlington UT Campus",
    "Address": "1101 S. Pecan St.",
    "loc": [
      -97.108333,
      32.726111
    ],
    "Active": "20-Sep-12",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "484391053",
    "siteID": "48_439_1053",
    "CAMS": "1053",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Fort Worth California Parkway North",
    "Address": "1198 California Parkway North",
    "loc": [
      -97.338056,
      32.664722
    ],
    "Active": "12-Mar-15",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484391062",
    "siteID": "48_439_1062",
    "CAMS": "1062",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Kennedale Treepoint Drive",
    "Address": "5419 Treepoint Drive",
    "loc": [
      -97.200278,
      32.658889
    ],
    "Active": "29-Jun-12",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "484391065",
    "siteID": "48_439_1065",
    "CAMS": "1065",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Fort Worth Joe B. Rushing Road",
    "Address": "2525 Joe B. Rushing Road",
    "loc": [
      -97.2911778,
      32.6724056
    ],
    "Active": "17-Sep-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "484391503",
    "siteID": "48_439_1503",
    "CAMS": "1503",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Fort Worth Benbrook Lake",
    "Address": "7001 Lakeside Drive",
    "loc": [
      -97.442658,
      32.646711
    ],
    "Active": "1-Oct-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "484392003",
    "siteID": "48_439_2003",
    "CAMS": "17",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Keller",
    "Address": "FAA Site off Alta Vista Road",
    "loc": [
      -97.282088,
      32.9224736
    ],
    "Active": "11-Feb-81",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484393009",
    "siteID": "48_439_3009",
    "CAMS": "0070, 0182 ",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Grapevine Fairway",
    "Address": "4100 Fairway Dr",
    "loc": [
      -97.0637211,
      32.9842596
    ],
    "Active": "4-Aug-00",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484393010",
    "siteID": "48_439_3010",
    "CAMS": "",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Stage Coach",
    "Address": "8900 West Freeway",
    "loc": [
      -97.47033,
      32.7392
    ],
    "Active": "1-Jan-02",
    "Deactive": "",
    "Owner": "City of Fort Worth Health Department"
  },
  {
    "AQS_Code": "484393011",
    "siteID": "48_439_3011",
    "CAMS": "61",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Arlington Municipal Airport",
    "Address": "5504 South Collins Street",
    "loc": [
      -97.0885849,
      32.6563574
    ],
    "Active": "17-Jan-02",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484395007",
    "siteID": "48_439_5007",
    "CAMS": "5007",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Arlington Airport KGKY",
    "Address": "Arlington Municipal Airport",
    "loc": [
      -97.095833,
      32.663889
    ],
    "Active": "22-Jan-03",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "484411509",
    "siteID": "48_441_1509",
    "CAMS": "1509",
    "TCEQRegion": "ABILENE",
    "Region": "3",
    "Name": "Abilene North 3rd Street",
    "Address": "TBD",
    "loc": [
      -99.729799,
      32.451011
    ],
    "Active": "18-Dec-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "484415015",
    "siteID": "48_441_5015",
    "CAMS": "5015",
    "TCEQRegion": "ABILENE",
    "Region": "3",
    "Name": "Abilene KABI",
    "Address": "Abilene Regional Airport",
    "loc": [
      -99.681944,
      32.411389
    ],
    "Active": "1-Aug-05",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "484515016",
    "siteID": "48_451_5016",
    "CAMS": "5016",
    "TCEQRegion": "SAN ANGELO",
    "Region": "8",
    "Name": "San Angelo KSJT",
    "Address": "San Angelo Regional Airport/Mathis Field",
    "loc": [
      -100.496389,
      31.357778
    ],
    "Active": "2-Sep-05",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "484530014",
    "siteID": "48_453_0014",
    "CAMS": "3",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Austin Northwest",
    "Address": "3724 North Hills Dr",
    "loc": [
      -97.7602554,
      30.3544356
    ],
    "Active": "1-Jan-79",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484530020",
    "siteID": "48_453_0020",
    "CAMS": "38",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Austin Audubon Society",
    "Address": "12200 Lime Creek Rd",
    "loc": [
      -97.8723005,
      30.4831681
    ],
    "Active": "28-Feb-97",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484530021",
    "siteID": "48_453_0021",
    "CAMS": "171",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Austin Webberville Rd",
    "Address": "2600B Webberville Rd",
    "loc": [
      -97.7128831,
      30.2632079
    ],
    "Active": "29-Sep-99",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484530326",
    "siteID": "48_453_0326",
    "CAMS": "326",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Zavala Elementary",
    "Address": "310 Robert T Martinez Jr Street",
    "loc": [
      -97.7203007,
      30.2583319
    ],
    "Active": "18-Feb-09",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484531026",
    "siteID": "48_453_1026",
    "CAMS": "1026",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Austin 5th Street",
    "Address": "2001 East 5th Street",
    "loc": [
      -97.7209,
      30.259506
    ],
    "Active": "4-Sep-14",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484531068",
    "siteID": "48_453_1068",
    "CAMS": "1068",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Austin North Interstate 35",
    "Address": "8912 N IH 35 SVRD SB",
    "loc": [
      -97.69166,
      30.35386
    ],
    "Active": "16-Apr-14",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484531603",
    "siteID": "48_453_1603",
    "CAMS": "1603",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Gorzycki Middle School",
    "Address": "7412 Slaughter Lane",
    "loc": [
      -97.893744,
      30.216397
    ],
    "Active": "16-Apr-14",
    "Deactive": "",
    "Owner": "Capitol Area Council of Governments"
  },
  {
    "AQS_Code": "484535001",
    "siteID": "48_453_5001",
    "CAMS": "5001, 5002 ",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Camp Mabry KATT",
    "Address": "Camp Mabry",
    "loc": [
      -97.7613889,
      30.3136111
    ],
    "Active": "15-Sep-98",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "484535003",
    "siteID": "48_453_5003",
    "CAMS": "5003",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "Austin Bergstrom KAUS",
    "Address": "Austin Bergstrom International Airport",
    "loc": [
      -97.67,
      30.1944444
    ],
    "Active": "17-Jun-04",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "484655017",
    "siteID": "48_465_5017",
    "CAMS": "5017",
    "TCEQRegion": "LAREDO",
    "Region": "16",
    "Name": "Del Rio KDRT",
    "Address": "Del Rio International Airport",
    "loc": [
      -100.925833,
      29.372778
    ],
    "Active": "1-Aug-05",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "484690003",
    "siteID": "48_469_0003",
    "CAMS": "87",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Victoria",
    "Address": "106 Mockingbird Lane",
    "loc": [
      -97.0055298,
      28.8361697
    ],
    "Active": "1-Apr-89",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484690609",
    "siteID": "48_469_0609",
    "CAMS": "609",
    "TCEQRegion": "CORPUS CHRISTI",
    "Region": "14",
    "Name": "Inez",
    "Address": "559 FM 444 South",
    "loc": [
      -96.78513,
      28.89962
    ],
    "Active": "9-Jul-10",
    "Deactive": "",
    "Owner": "City of Victoria"
  },
  {
    "AQS_Code": "484715012",
    "siteID": "48_471_5012",
    "CAMS": "5012",
    "TCEQRegion": "HOUSTON",
    "Region": "12",
    "Name": "Huntsville KUTS",
    "Address": "Huntsville Municipal Airport",
    "loc": [
      -95.587222,
      30.755278
    ],
    "Active": "1-Aug-05",
    "Deactive": "",
    "Owner": "National Weather Service"
  },
  {
    "AQS_Code": "484790016",
    "siteID": "48_479_0016",
    "CAMS": "0044, 0144 ",
    "TCEQRegion": "LAREDO",
    "Region": "16",
    "Name": "Laredo Vidaurri",
    "Address": "2020 Vidaurri Ave",
    "loc": [
      -99.5152185,
      27.5174485
    ],
    "Active": "15-Feb-96",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484790017",
    "siteID": "48_479_0017",
    "CAMS": "0066, 0173 ",
    "TCEQRegion": "LAREDO",
    "Region": "16",
    "Name": "Laredo Bridge",
    "Address": "700 Zaragosa St",
    "loc": [
      -99.5029843,
      27.5018255
    ],
    "Active": "21-Sep-99",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484790313",
    "siteID": "48_479_0313",
    "CAMS": "313",
    "TCEQRegion": "LAREDO",
    "Region": "16",
    "Name": "World Trade Bridge",
    "Address": "Mines Road 11601 FM 1472",
    "loc": [
      -99.533333,
      27.599444
    ],
    "Active": "13-Aug-02",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484851508",
    "siteID": "48_485_1508",
    "CAMS": "1508",
    "TCEQRegion": "ABILENE",
    "Region": "3",
    "Name": "Wichita Falls MWSU",
    "Address": "MWSU grounds",
    "loc": [
      -98.506096,
      33.849304
    ],
    "Active": "19-Dec-13",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "484910690",
    "siteID": "48_491_0690",
    "CAMS": "690",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "CAPCOG Lake Georgetown",
    "Address": "500 Lake Overlook Drive",
    "loc": [
      -97.734579,
      30.6664421
    ],
    "Active": "20-Sep-07",
    "Deactive": "",
    "Owner": "Capitol Area Council of Governments"
  },
  {
    "AQS_Code": "484916602",
    "siteID": "48_491_6602",
    "CAMS": "6602",
    "TCEQRegion": "AUSTIN",
    "Region": "11",
    "Name": "CAPCOG Hutto College Street",
    "Address": "200 College Street",
    "loc": [
      -97.541794,
      30.545706
    ],
    "Active": "18-May-11",
    "Deactive": "",
    "Owner": "Capitol Area Council of Governments"
  },
  {
    "AQS_Code": "484931038",
    "siteID": "48_493_1038",
    "CAMS": "1038",
    "TCEQRegion": "SAN ANTONIO",
    "Region": "13",
    "Name": "Floresville Hospital Boulevard",
    "Address": "1404 Hospital Blvd",
    "loc": [
      -98.14806,
      29.130675
    ],
    "Active": "18-Jul-13",
    "Deactive": "",
    "Owner": "TCEQ"
  },
  {
    "AQS_Code": "484970088",
    "siteID": "48_497_0088",
    "CAMS": "88",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Decatur Thompson",
    "Address": "301 E Thompson Street",
    "loc": [
      -97.584445,
      33.221721
    ],
    "Active": "6-Oct-10",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "484971064",
    "siteID": "48_497_1064",
    "CAMS": "1064",
    "TCEQRegion": "DALLAS/FORT WORTH",
    "Region": "4",
    "Name": "Rhome Seven Hills Road",
    "Address": "639 CR 4651",
    "loc": [
      -97.486618,
      33.044028
    ],
    "Active": "12-Nov-12",
    "Deactive": "",
    "Owner": "North Texas Commission"
  },
  {
    "AQS_Code": "800060003",
    "siteID": "80_006_0003",
    "CAMS": "",
    "TCEQRegion": "",
    "Region": "",
    "Name": "Zenco",
    "Address": "Carretera Pan Americana - Zenith Corp",
    "loc": [
      -106.443056,
      31.638056
    ],
    "Active": "4-Jun-90",
    "Deactive": "",
    "Owner": "SEMARNAP"
  },
  {
    "AQS_Code": "800060004",
    "siteID": "80_006_0004",
    "CAMS": "661",
    "TCEQRegion": "",
    "Region": "",
    "Name": "CD Juarez Advance",
    "Address": "Calle El Cid",
    "loc": [
      -106.459722,
      31.689722
    ],
    "Active": "4-Jun-90",
    "Deactive": "",
    "Owner": "SEMARNAP"
  },
  {
    "AQS_Code": "800060005",
    "siteID": "80_006_0005",
    "CAMS": "",
    "TCEQRegion": "",
    "Region": "",
    "Name": "Benito Juarez Police Station",
    "Address": "Jose Ma Morelos Y Paron",
    "loc": [
      -106.3545,
      31.654
    ],
    "Active": "1-Jul-10",
    "Deactive": "",
    "Owner": "EPA/OAQPS/MQAG"
  },
  {
    "AQS_Code": "800060006",
    "siteID": "80_006_0006",
    "CAMS": "662",
    "TCEQRegion": "",
    "Region": "",
    "Name": "CD Juarez 20 30 Club",
    "Address": "Calle Jose Borunda",
    "loc": [
      -106.459722,
      31.735556
    ],
    "Active": "22-Jul-96",
    "Deactive": "",
    "Owner": "SEMARNAP"
  },
  {
    "AQS_Code": "800060007",
    "siteID": "80_006_0007",
    "CAMS": "663",
    "TCEQRegion": "",
    "Region": "",
    "Name": "CD Juarez Delphi",
    "Address": "Avenida De La Industria",
    "loc": [
      -106.395278,
      31.712222
    ],
    "Active": "28-Feb-95",
    "Deactive": "",
    "Owner": "SEMARNAP"
  },
  {
    "AQS_Code": "800060011",
    "siteID": "80_006_0011",
    "CAMS": "",
    "TCEQRegion": "",
    "Region": "",
    "Name": "Ninez Mexicana Juarez",
    "Address": "Boulevard Zaragoza",
    "loc": [
      -106.4542,
      31.66127
    ],
    "Active": "12-Aug-10",
    "Deactive": "",
    "Owner": "City of El Paso Environmental Services Department"
  }
    ];
    
    // loop through each site and insert into the database
    _.each(SitesData, function(aSite) {        
            Sites.insert(aSite);        
    });
        
        Sites._ensureIndex({loc: '2d'});
};
    if (UHMain.find().count() === 0) {    
    var sampleAirData =[{"epoch":1430456400,"siteID":"48_201_0695","o3":48.86300,"temp":66.51800,"humid":53.89600},
{"epoch":1430456700,"siteID":"48_201_0695","o3":48.69400,"temp":66.44400,"humid":54.13100},
{"epoch":1430457000,"siteID":"48_201_0695","o3":47.55000,"temp":66.30500,"humid":54.58900},
{"epoch":1430457300,"siteID":"48_201_0695","o3":47.24000,"temp":66.13600,"humid":55.10600},
{"epoch":1430457600,"siteID":"48_201_0695","o3":47.18000,"temp":66.03800,"humid":55.41800},
{"epoch":1430457900,"siteID":"48_201_0695","o3":45.87700,"temp":65.97900,"humid":55.70800},
{"epoch":1430458200,"siteID":"48_201_0695","o3":45.96600,"temp":65.91200,"humid":55.84800},
{"epoch":1430458500,"siteID":"48_201_0695","o3":45.81900,"temp":65.80200,"humid":56.14700},
{"epoch":1430458800,"siteID":"48_201_0695","o3":47.36200,"temp":65.69400,"humid":56.32000},
{"epoch":1430459100,"siteID":"48_201_0695","o3":48.10600,"temp":65.61500,"humid":56.56500},
{"epoch":1430459400,"siteID":"48_201_0695","o3":49.60300,"temp":65.64000,"humid":56.40500},
{"epoch":1430459700,"siteID":"48_201_0695","o3":50.14600,"temp":65.64000,"humid":56.41900},
{"epoch":1430460000,"siteID":"48_201_0695","o3":50.36500,"temp":65.55900,"humid":56.62400},
{"epoch":1430460300,"siteID":"48_201_0695","o3":52.05600,"temp":65.53400,"humid":56.52400},
{"epoch":1430460600,"siteID":"48_201_0695","o3":53.46600,"temp":65.53700,"humid":56.39400},
{"epoch":1430460900,"siteID":"48_201_0695","o3":52.55200,"temp":65.62000,"humid":56.22000},
{"epoch":1430461200,"siteID":"48_201_0695","o3":53.63900,"temp":65.70900,"humid":56.11200},
{"epoch":1430461500,"siteID":"48_201_0695","o3":52.66800,"temp":65.58500,"humid":56.50300},
{"epoch":1430461800,"siteID":"48_201_0695","o3":52.86400,"temp":65.64200,"humid":56.42900},
{"epoch":1430462100,"siteID":"48_201_0695","o3":52.01700,"temp":65.38400,"humid":57.11800},
{"epoch":1430462400,"siteID":"48_201_0695","o3":50.88600,"temp":65.40800,"humid":57.28400},
{"epoch":1430462700,"siteID":"48_201_0695","o3":49.10200,"temp":65.33300,"humid":57.70200},
{"epoch":1430463000,"siteID":"48_201_0695","o3":50.62300,"temp":65.19500,"humid":58.09800},
{"epoch":1430463300,"siteID":"48_201_0695","o3":50.78900,"temp":65.19700,"humid":58.12700},
{"epoch":1430463600,"siteID":"48_201_0695","o3":49.46500,"temp":65.02500,"humid":58.69800},
{"epoch":1430463900,"siteID":"48_201_0695","o3":49.71600,"temp":64.98700,"humid":58.86700},
{"epoch":1430464200,"siteID":"48_201_0695","o3":49.17300,"temp":64.96600,"humid":59.04000},
{"epoch":1430464500,"siteID":"48_201_0695","o3":48.90300,"temp":64.87600,"humid":59.37700},
{"epoch":1430464800,"siteID":"48_201_0695","o3":48.32000,"temp":64.80600,"humid":59.63700},
{"epoch":1430465100,"siteID":"48_201_0695","o3":47.89200,"temp":64.70000,"humid":59.93400},
{"epoch":1430465400,"siteID":"48_201_0695","o3":47.02200,"temp":64.57100,"humid":60.44200},
{"epoch":1430465700,"siteID":"48_201_0695","o3":47.71100,"temp":64.49000,"humid":60.66000},
{"epoch":1430466000,"siteID":"48_201_0695","o3":51.40500,"temp":64.59300,"humid":60.55600},
{"epoch":1430466300,"siteID":"48_201_0695","o3":52.47900,"temp":64.68500,"humid":60.40300},
{"epoch":1430466600,"siteID":"48_201_0695","o3":52.04300,"temp":64.65000,"humid":60.59100},
{"epoch":1430466900,"siteID":"48_201_0695","o3":51.96500,"temp":64.61500,"humid":60.70800},
{"epoch":1430467200,"siteID":"48_201_0695","o3":51.89100,"temp":64.50400,"humid":61.04300},
{"epoch":1430467500,"siteID":"48_201_0695","o3":50.95800,"temp":64.43000,"humid":61.40100},
{"epoch":1430467800,"siteID":"48_201_0695","o3":49.25500,"temp":64.26400,"humid":61.84500},
{"epoch":1430468100,"siteID":"48_201_0695","o3":49.32300,"temp":64.13000,"humid":62.36900},
{"epoch":1430468400,"siteID":"48_201_0695","o3":50.15800,"temp":64.13600,"humid":62.49800},
{"epoch":1430468700,"siteID":"48_201_0695","o3":49.53100,"temp":64.01700,"humid":62.81000},
{"epoch":1430469000,"siteID":"48_201_0695","o3":48.48900,"temp":64.07300,"humid":63.03500},
{"epoch":1430469300,"siteID":"48_201_0695","o3":48.41700,"temp":64.48200,"humid":62.74000},
{"epoch":1430469600,"siteID":"48_201_0695","o3":46.70600,"temp":64.62700,"humid":62.42700},
{"epoch":1430469900,"siteID":"48_201_0695","o3":45.16100,"temp":64.68500,"humid":62.42800},
{"epoch":1430470200,"siteID":"48_201_0695","o3":43.66100,"temp":64.63600,"humid":62.42500},
{"epoch":1430470500,"siteID":"48_201_0695","o3":44.78100,"temp":64.62000,"humid":62.68500},
{"epoch":1430470800,"siteID":"48_201_0695","o3":44.17500,"temp":64.79900,"humid":62.39800},
{"epoch":1430471100,"siteID":"48_201_0695","o3":41.44600,"temp":64.56800,"humid":62.75900},
{"epoch":1430471400,"siteID":"48_201_0695","o3":42.05400,"temp":64.51000,"humid":62.97200},
{"epoch":1430471700,"siteID":"48_201_0695","o3":39.82500,"temp":64.46200,"humid":63.14800},
{"epoch":1430472000,"siteID":"48_201_0695","o3":43.59500,"temp":64.23300,"humid":63.84300},
{"epoch":1430472300,"siteID":"48_201_0695","o3":44.82900,"temp":64.30500,"humid":63.53500},
{"epoch":1430472600,"siteID":"48_201_0695","o3":45.39200,"temp":64.31200,"humid":63.39300},
{"epoch":1430472900,"siteID":"48_201_0695","o3":null,"temp":64.34600,"humid":63.20800},
{"epoch":1430473200,"siteID":"48_201_0695","o3":null,"temp":64.53900,"humid":62.56000},
{"epoch":1430473500,"siteID":"48_201_0695","o3":null,"temp":64.72100,"humid":61.93300},
{"epoch":1430473800,"siteID":"48_201_0695","o3":null,"temp":64.86200,"humid":61.40300},
{"epoch":1430474100,"siteID":"48_201_0695","o3":null,"temp":64.94100,"humid":61.04000},
{"epoch":1430474400,"siteID":"48_201_0695","o3":null,"temp":64.90200,"humid":61.29600},
{"epoch":1430474700,"siteID":"48_201_0695","o3":null,"temp":64.65000,"humid":62.00600},
{"epoch":1430475000,"siteID":"48_201_0695","o3":null,"temp":64.38800,"humid":62.69500},
{"epoch":1430475300,"siteID":"48_201_0695","o3":null,"temp":64.16600,"humid":63.32700},
{"epoch":1430475600,"siteID":"48_201_0695","o3":44.06700,"temp":63.98600,"humid":63.93700},
{"epoch":1430475900,"siteID":"48_201_0695","o3":46.87500,"temp":64.04000,"humid":64.12900},
{"epoch":1430476200,"siteID":"48_201_0695","o3":48.13100,"temp":64.26400,"humid":63.70400},
{"epoch":1430476500,"siteID":"48_201_0695","o3":46.90600,"temp":64.36800,"humid":63.45800},
{"epoch":1430476800,"siteID":"48_201_0695","o3":48.06700,"temp":64.34500,"humid":63.51700},
{"epoch":1430477100,"siteID":"48_201_0695","o3":45.88800,"temp":64.38000,"humid":63.36600},
{"epoch":1430477400,"siteID":"48_201_0695","o3":43.74700,"temp":64.37500,"humid":63.42600},
{"epoch":1430477700,"siteID":"48_201_0695","o3":43.74500,"temp":64.48500,"humid":63.11800},
{"epoch":1430478000,"siteID":"48_201_0695","o3":42.59600,"temp":64.56200,"humid":62.93400},
{"epoch":1430478300,"siteID":"48_201_0695","o3":41.53900,"temp":64.64100,"humid":62.76500},
{"epoch":1430478600,"siteID":"48_201_0695","o3":40.59700,"temp":64.64400,"humid":62.76100},
{"epoch":1430478900,"siteID":"48_201_0695","o3":38.11600,"temp":64.52100,"humid":63.09900},
{"epoch":1430479200,"siteID":"48_201_0695","o3":34.44800,"temp":64.27600,"humid":63.80900},
{"epoch":1430479500,"siteID":"48_201_0695","o3":31.45500,"temp":64.07500,"humid":64.53700},
{"epoch":1430479800,"siteID":"48_201_0695","o3":28.83200,"temp":64.05300,"humid":64.77400},
{"epoch":1430480100,"siteID":"48_201_0695","o3":26.43700,"temp":63.97500,"humid":64.90900},
{"epoch":1430480400,"siteID":"48_201_0695","o3":25.42700,"temp":63.92700,"humid":65.06300},
{"epoch":1430480700,"siteID":"48_201_0695","o3":20.68600,"temp":63.97200,"humid":64.87400},
{"epoch":1430481000,"siteID":"48_201_0695","o3":21.59900,"temp":64.20200,"humid":64.35300},
{"epoch":1430481300,"siteID":"48_201_0695","o3":27.84800,"temp":64.31200,"humid":64.19500},
{"epoch":1430481600,"siteID":"48_201_0695","o3":31.66500,"temp":64.44900,"humid":63.89000},
{"epoch":1430481900,"siteID":"48_201_0695","o3":30.07200,"temp":64.68400,"humid":63.06400},
{"epoch":1430482200,"siteID":"48_201_0695","o3":30.79000,"temp":64.69600,"humid":62.92300},
{"epoch":1430482500,"siteID":"48_201_0695","o3":33.46200,"temp":64.80000,"humid":62.90200},
{"epoch":1430482800,"siteID":"48_201_0695","o3":29.60800,"temp":65.01000,"humid":62.56900},
{"epoch":1430483100,"siteID":"48_201_0695","o3":20.40800,"temp":65.52300,"humid":61.82200},
{"epoch":1430483400,"siteID":"48_201_0695","o3":18.70700,"temp":65.66600,"humid":61.64700},
{"epoch":1430483700,"siteID":"48_201_0695","o3":14.72400,"temp":65.36000,"humid":62.11700},
{"epoch":1430484000,"siteID":"48_201_0695","o3":20.47300,"temp":65.24300,"humid":62.26900},
{"epoch":1430484300,"siteID":"48_201_0695","o3":22.60300,"temp":65.39700,"humid":62.00300},
{"epoch":1430484600,"siteID":"48_201_0695","o3":20.12900,"temp":65.47800,"humid":62.22600},
{"epoch":1430484900,"siteID":"48_201_0695","o3":17.11700,"temp":65.69100,"humid":62.45500},
{"epoch":1430485200,"siteID":"48_201_0695","o3":19.36800,"temp":65.86800,"humid":62.03600},
{"epoch":1430485500,"siteID":"48_201_0695","o3":20.13200,"temp":66.12200,"humid":61.57300},
{"epoch":1430485800,"siteID":"48_201_0695","o3":19.98600,"temp":66.54800,"humid":61.40300},
{"epoch":1430486100,"siteID":"48_201_0695","o3":24.78700,"temp":67.04600,"humid":59.62800},
{"epoch":1430486400,"siteID":"48_201_0695","o3":25.51900,"temp":67.22800,"humid":59.30300},
{"epoch":1430486700,"siteID":"48_201_0695","o3":26.48300,"temp":67.65200,"humid":58.45300},
{"epoch":1430487000,"siteID":"48_201_0695","o3":27.42500,"temp":67.92600,"humid":57.79200},
{"epoch":1430487300,"siteID":"48_201_0695","o3":29.97000,"temp":68.31400,"humid":56.75100},
{"epoch":1430487600,"siteID":"48_201_0695","o3":31.19600,"temp":68.59400,"humid":56.21200},
{"epoch":1430487900,"siteID":"48_201_0695","o3":29.86700,"temp":69.06100,"humid":55.79000},
{"epoch":1430488200,"siteID":"48_201_0695","o3":30.93200,"temp":69.41600,"humid":55.06100},
{"epoch":1430488500,"siteID":"48_201_0695","o3":32.91100,"temp":69.86900,"humid":54.31400},
{"epoch":1430488800,"siteID":"48_201_0695","o3":42.51500,"temp":69.85000,"humid":52.40600},
{"epoch":1430489100,"siteID":"48_201_0695","o3":44.85800,"temp":69.55200,"humid":51.89400},
{"epoch":1430489400,"siteID":"48_201_0695","o3":45.54400,"temp":69.58600,"humid":51.77600},
{"epoch":1430489700,"siteID":"48_201_0695","o3":44.28000,"temp":69.88300,"humid":51.54300},
{"epoch":1430490000,"siteID":"48_201_0695","o3":44.81600,"temp":70.15000,"humid":51.07400},
{"epoch":1430490300,"siteID":"48_201_0695","o3":44.76400,"temp":70.78500,"humid":50.00500},
{"epoch":1430490600,"siteID":"48_201_0695","o3":46.06400,"temp":70.58700,"humid":49.69700},
{"epoch":1430490900,"siteID":"48_201_0695","o3":46.25200,"temp":70.60400,"humid":49.53700},
{"epoch":1430491200,"siteID":"48_201_0695","o3":46.25700,"temp":70.79500,"humid":49.55800},
{"epoch":1430491500,"siteID":"48_201_0695","o3":46.32500,"temp":70.87100,"humid":48.62000},
{"epoch":1430491800,"siteID":"48_201_0695","o3":45.01000,"temp":71.44900,"humid":48.40100},
{"epoch":1430492100,"siteID":"48_201_0695","o3":46.42100,"temp":71.60700,"humid":47.14300},
{"epoch":1430492400,"siteID":"48_201_0695","o3":45.56600,"temp":71.45900,"humid":48.07500},
{"epoch":1430492700,"siteID":"48_201_0695","o3":44.60400,"temp":71.60800,"humid":48.09200},
{"epoch":1430493000,"siteID":"48_201_0695","o3":45.32200,"temp":71.98600,"humid":47.27000},
{"epoch":1430493300,"siteID":"48_201_0695","o3":45.02900,"temp":71.77100,"humid":47.40200},
{"epoch":1430493600,"siteID":"48_201_0695","o3":46.13400,"temp":72.28700,"humid":46.92700},
{"epoch":1430493900,"siteID":"48_201_0695","o3":49.55000,"temp":72.18800,"humid":45.98000},
{"epoch":1430494200,"siteID":"48_201_0695","o3":52.42900,"temp":72.82500,"humid":44.03300},
{"epoch":1430494500,"siteID":"48_201_0695","o3":52.17500,"temp":73.82700,"humid":43.06600},
{"epoch":1430494800,"siteID":"48_201_0695","o3":52.42900,"temp":73.73000,"humid":42.53700},
{"epoch":1430495100,"siteID":"48_201_0695","o3":52.87700,"temp":74.59700,"humid":42.59900},
{"epoch":1430495400,"siteID":"48_201_0695","o3":56.88000,"temp":73.97700,"humid":41.76400},
{"epoch":1430495700,"siteID":"48_201_0695","o3":59.11500,"temp":73.27600,"humid":41.13600},
{"epoch":1430496000,"siteID":"48_201_0695","o3":59.55400,"temp":73.60500,"humid":40.66100},
{"epoch":1430496300,"siteID":"48_201_0695","o3":59.17600,"temp":74.10100,"humid":40.09700},
{"epoch":1430496600,"siteID":"48_201_0695","o3":58.51800,"temp":74.46600,"humid":39.87800},
{"epoch":1430496900,"siteID":"48_201_0695","o3":57.48600,"temp":75.00600,"humid":39.37000},
{"epoch":1430497200,"siteID":"48_201_0695","o3":57.16300,"temp":74.89300,"humid":38.92300},
{"epoch":1430497500,"siteID":"48_201_0695","o3":56.77400,"temp":75.65200,"humid":37.77000},
{"epoch":1430497800,"siteID":"48_201_0695","o3":57.18200,"temp":76.09000,"humid":36.86600},
{"epoch":1430498100,"siteID":"48_201_0695","o3":56.79000,"temp":75.47600,"humid":37.27500},
{"epoch":1430498400,"siteID":"48_201_0695","o3":58.21500,"temp":75.50300,"humid":36.55200},
{"epoch":1430498700,"siteID":"48_201_0695","o3":56.89400,"temp":76.17700,"humid":36.83700},
{"epoch":1430499000,"siteID":"48_201_0695","o3":61.66600,"temp":76.57400,"humid":34.25300},
{"epoch":1430499300,"siteID":"48_201_0695","o3":62.10000,"temp":76.40800,"humid":34.10700},
{"epoch":1430499600,"siteID":"48_201_0695","o3":64.84600,"temp":76.42600,"humid":33.15800},
{"epoch":1430499900,"siteID":"48_201_0695","o3":66.87400,"temp":76.77400,"humid":31.14800},
{"epoch":1430500200,"siteID":"48_201_0695","o3":67.84600,"temp":77.03000,"humid":30.69200},
{"epoch":1430500500,"siteID":"48_201_0695","o3":69.03800,"temp":77.41000,"humid":29.44800},
{"epoch":1430500800,"siteID":"48_201_0695","o3":69.03400,"temp":78.24800,"humid":27.80000},
{"epoch":1430501100,"siteID":"48_201_0695","o3":69.78500,"temp":78.08600,"humid":28.10400},
{"epoch":1430501400,"siteID":"48_201_0695","o3":69.31100,"temp":80.18000,"humid":26.63900},
{"epoch":1430501700,"siteID":"48_201_0695","o3":68.07100,"temp":79.03000,"humid":29.40900},
{"epoch":1430502000,"siteID":"48_201_0695","o3":69.60000,"temp":77.76800,"humid":29.43000},
{"epoch":1430502300,"siteID":"48_201_0695","o3":69.68000,"temp":77.51300,"humid":29.82800},
{"epoch":1430502600,"siteID":"48_201_0695","o3":70.84500,"temp":77.86000,"humid":29.13600},
{"epoch":1430502900,"siteID":"48_201_0695","o3":71.05000,"temp":78.31100,"humid":29.13100},
{"epoch":1430503200,"siteID":"48_201_0695","o3":70.53000,"temp":79.34500,"humid":28.10500},
{"epoch":1430503500,"siteID":"48_201_0695","o3":71.39000,"temp":79.28200,"humid":27.50400},
{"epoch":1430503800,"siteID":"48_201_0695","o3":71.93600,"temp":79.20300,"humid":27.58000},
{"epoch":1430504100,"siteID":"48_201_0695","o3":71.76700,"temp":78.43000,"humid":27.92700},
{"epoch":1430504400,"siteID":"48_201_0695","o3":70.73300,"temp":79.01900,"humid":27.71300},
{"epoch":1430504700,"siteID":"48_201_0695","o3":70.84500,"temp":78.96100,"humid":28.08500},
{"epoch":1430505000,"siteID":"48_201_0695","o3":70.09900,"temp":78.76100,"humid":28.34500},
{"epoch":1430505300,"siteID":"48_201_0695","o3":72.04800,"temp":78.75900,"humid":28.65800},
{"epoch":1430505600,"siteID":"48_201_0695","o3":74.35800,"temp":77.67300,"humid":29.22800},
{"epoch":1430505900,"siteID":"48_201_0695","o3":76.64500,"temp":77.66800,"humid":28.92000},
{"epoch":1430506200,"siteID":"48_201_0695","o3":77.10100,"temp":78.57700,"humid":28.22200},
{"epoch":1430506500,"siteID":"48_201_0695","o3":76.14000,"temp":79.83800,"humid":27.94300},
{"epoch":1430506800,"siteID":"48_201_0695","o3":77.11900,"temp":80.65800,"humid":27.02100},
{"epoch":1430507100,"siteID":"48_201_0695","o3":79.01700,"temp":80.51700,"humid":26.58300},
{"epoch":1430507400,"siteID":"48_201_0695","o3":80.81500,"temp":79.57800,"humid":26.90300},
{"epoch":1430507700,"siteID":"48_201_0695","o3":82.30800,"temp":78.30200,"humid":27.87900},
{"epoch":1430508000,"siteID":"48_201_0695","o3":82.59800,"temp":78.31400,"humid":27.96100},
{"epoch":1430508300,"siteID":"48_201_0695","o3":80.59000,"temp":79.49800,"humid":27.50900},
{"epoch":1430508600,"siteID":"48_201_0695","o3":82.77500,"temp":80.23000,"humid":26.67800},
{"epoch":1430508900,"siteID":"48_201_0695","o3":81.41200,"temp":80.41400,"humid":27.04300},
{"epoch":1430509200,"siteID":"48_201_0695","o3":82.64900,"temp":81.02600,"humid":26.00900},
{"epoch":1430509500,"siteID":"48_201_0695","o3":83.08800,"temp":80.85500,"humid":26.12800},
{"epoch":1430509800,"siteID":"48_201_0695","o3":83.29000,"temp":79.56400,"humid":26.87200},
{"epoch":1430510100,"siteID":"48_201_0695","o3":84.02600,"temp":78.89700,"humid":27.22800},
{"epoch":1430510400,"siteID":"48_201_0695","o3":82.92500,"temp":79.31600,"humid":27.13800},
{"epoch":1430510700,"siteID":"48_201_0695","o3":83.01000,"temp":78.84700,"humid":27.80800},
{"epoch":1430511000,"siteID":"48_201_0695","o3":83.38200,"temp":78.86700,"humid":27.97600},
{"epoch":1430511300,"siteID":"48_201_0695","o3":84.06900,"temp":78.66200,"humid":27.92100},
{"epoch":1430511600,"siteID":"48_201_0695","o3":84.85800,"temp":78.90100,"humid":27.96100},
{"epoch":1430511900,"siteID":"48_201_0695","o3":86.73200,"temp":79.28100,"humid":27.07800},
{"epoch":1430512200,"siteID":"48_201_0695","o3":86.86300,"temp":79.52300,"humid":26.90300},
{"epoch":1430512500,"siteID":"48_201_0695","o3":86.42900,"temp":79.72300,"humid":27.27700},
{"epoch":1430512800,"siteID":"48_201_0695","o3":89.17900,"temp":79.55600,"humid":26.47000},
{"epoch":1430513100,"siteID":"48_201_0695","o3":90.39800,"temp":80.70800,"humid":25.36100},
{"epoch":1430513400,"siteID":"48_201_0695","o3":90.10500,"temp":81.85500,"humid":24.67500},
{"epoch":1430513700,"siteID":"48_201_0695","o3":88.59900,"temp":81.84300,"humid":25.37600},
{"epoch":1430514000,"siteID":"48_201_0695","o3":88.96600,"temp":81.26600,"humid":26.01000},
{"epoch":1430514300,"siteID":"48_201_0695","o3":88.23500,"temp":80.46400,"humid":26.64100},
{"epoch":1430514600,"siteID":"48_201_0695","o3":86.71700,"temp":80.60100,"humid":26.60100},
{"epoch":1430514900,"siteID":"48_201_0695","o3":90.09600,"temp":80.22700,"humid":25.95600},
{"epoch":1430515200,"siteID":"48_201_0695","o3":90.88600,"temp":79.64300,"humid":26.56000},
{"epoch":1430515500,"siteID":"48_201_0695","o3":87.40700,"temp":79.90100,"humid":26.98300},
{"epoch":1430515800,"siteID":"48_201_0695","o3":86.10100,"temp":79.84100,"humid":27.21200},
{"epoch":1430516100,"siteID":"48_201_0695","o3":88.78200,"temp":79.51400,"humid":27.30000},
{"epoch":1430516400,"siteID":"48_201_0695","o3":86.44800,"temp":79.71400,"humid":27.49500},
{"epoch":1430516700,"siteID":"48_201_0695","o3":87.00600,"temp":80.38200,"humid":27.17200},
{"epoch":1430517000,"siteID":"48_201_0695","o3":88.92300,"temp":80.00600,"humid":27.13800},
{"epoch":1430517300,"siteID":"48_201_0695","o3":88.00000,"temp":79.70100,"humid":27.52100},
{"epoch":1430517600,"siteID":"48_201_0695","o3":88.74500,"temp":79.31300,"humid":27.67200},
{"epoch":1430517900,"siteID":"48_201_0695","o3":88.59300,"temp":79.21600,"humid":27.75400},
{"epoch":1430518200,"siteID":"48_201_0695","o3":89.59000,"temp":79.49700,"humid":27.47700},
{"epoch":1430518500,"siteID":"48_201_0695","o3":87.83200,"temp":80.16800,"humid":27.04200},
{"epoch":1430518800,"siteID":"48_201_0695","o3":87.75900,"temp":80.25200,"humid":26.97800},
{"epoch":1430519100,"siteID":"48_201_0695","o3":88.53900,"temp":80.19400,"humid":27.17300},
{"epoch":1430519400,"siteID":"48_201_0695","o3":88.28200,"temp":79.68500,"humid":27.54200},
{"epoch":1430519700,"siteID":"48_201_0695","o3":89.85300,"temp":79.43000,"humid":27.39700},
{"epoch":1430520000,"siteID":"48_201_0695","o3":86.84000,"temp":79.71700,"humid":27.35800},
{"epoch":1430520300,"siteID":"48_201_0695","o3":87.66900,"temp":79.42800,"humid":27.39200},
{"epoch":1430520600,"siteID":"48_201_0695","o3":87.15900,"temp":79.67600,"humid":27.38100},
{"epoch":1430520900,"siteID":"48_201_0695","o3":90.09700,"temp":79.54100,"humid":27.26700},
{"epoch":1430521200,"siteID":"48_201_0695","o3":89.46100,"temp":79.54700,"humid":27.59300},
{"epoch":1430521500,"siteID":"48_201_0695","o3":90.65000,"temp":79.56200,"humid":27.76000},
{"epoch":1430521800,"siteID":"48_201_0695","o3":90.69300,"temp":79.69000,"humid":27.67800},
{"epoch":1430522100,"siteID":"48_201_0695","o3":91.85500,"temp":79.52300,"humid":27.48800},
{"epoch":1430522400,"siteID":"48_201_0695","o3":91.15800,"temp":79.72700,"humid":27.33700},
{"epoch":1430522700,"siteID":"48_201_0695","o3":90.47600,"temp":80.52000,"humid":26.69600},
{"epoch":1430523000,"siteID":"48_201_0695","o3":91.82800,"temp":80.20500,"humid":26.68500},
{"epoch":1430523300,"siteID":"48_201_0695","o3":92.04900,"temp":79.64000,"humid":27.17400},
{"epoch":1430523600,"siteID":"48_201_0695","o3":89.67100,"temp":79.60300,"humid":26.94700},
{"epoch":1430523900,"siteID":"48_201_0695","o3":87.88900,"temp":79.93900,"humid":26.98500},
{"epoch":1430524200,"siteID":"48_201_0695","o3":87.90900,"temp":79.73000,"humid":27.51200},
{"epoch":1430524500,"siteID":"48_201_0695","o3":86.88700,"temp":79.65200,"humid":27.70700},
{"epoch":1430524800,"siteID":"48_201_0695","o3":86.82800,"temp":79.50000,"humid":27.53500},
{"epoch":1430525100,"siteID":"48_201_0695","o3":87.33600,"temp":78.87800,"humid":29.91300},
{"epoch":1430525400,"siteID":"48_201_0695","o3":83.81200,"temp":78.52900,"humid":31.15400},
{"epoch":1430525700,"siteID":"48_201_0695","o3":89.01400,"temp":78.35600,"humid":30.54200},
{"epoch":1430526000,"siteID":"48_201_0695","o3":82.84300,"temp":78.37400,"humid":30.59800},
{"epoch":1430526300,"siteID":"48_201_0695","o3":75.09200,"temp":78.00600,"humid":32.32900},
{"epoch":1430526600,"siteID":"48_201_0695","o3":73.74900,"temp":77.62700,"humid":33.69300},
{"epoch":1430526900,"siteID":"48_201_0695","o3":73.02700,"temp":77.24800,"humid":35.10700},
{"epoch":1430527200,"siteID":"48_201_0695","o3":70.66800,"temp":77.02300,"humid":36.02300},
{"epoch":1430527500,"siteID":"48_201_0695","o3":69.06400,"temp":76.87100,"humid":36.56400},
{"epoch":1430527800,"siteID":"48_201_0695","o3":68.22700,"temp":76.66200,"humid":36.30500},
{"epoch":1430528100,"siteID":"48_201_0695","o3":67.78300,"temp":76.47000,"humid":35.72000},
{"epoch":1430528400,"siteID":"48_201_0695","o3":66.19900,"temp":76.31100,"humid":36.27400},
{"epoch":1430528700,"siteID":"48_201_0695","o3":64.81800,"temp":76.15500,"humid":36.73800},
{"epoch":1430529000,"siteID":"48_201_0695","o3":64.71700,"temp":76.04000,"humid":36.95800},
{"epoch":1430529300,"siteID":"48_201_0695","o3":63.24100,"temp":75.90100,"humid":37.50900},
{"epoch":1430529600,"siteID":"48_201_0695","o3":62.43100,"temp":75.81700,"humid":37.72300},
{"epoch":1430529900,"siteID":"48_201_0695","o3":61.62100,"temp":75.68500,"humid":38.35500},
{"epoch":1430530200,"siteID":"48_201_0695","o3":61.49500,"temp":75.58700,"humid":38.25500},
{"epoch":1430530500,"siteID":"48_201_0695","o3":61.65900,"temp":75.47400,"humid":38.31500},
{"epoch":1430530800,"siteID":"48_201_0695","o3":61.36100,"temp":75.31000,"humid":38.60800},
{"epoch":1430531100,"siteID":"48_201_0695","o3":60.56400,"temp":75.11500,"humid":39.21800},
{"epoch":1430531400,"siteID":"48_201_0695","o3":58.59000,"temp":74.88300,"humid":39.82000},
{"epoch":1430531700,"siteID":"48_201_0695","o3":57.50600,"temp":74.64500,"humid":40.14000},
{"epoch":1430532000,"siteID":"48_201_0695","o3":58.58700,"temp":74.64300,"humid":39.74200},
{"epoch":1430532300,"siteID":"48_201_0695","o3":58.57400,"temp":74.61900,"humid":39.51300},
{"epoch":1430532600,"siteID":"48_201_0695","o3":56.80000,"temp":74.40300,"humid":40.34800},
{"epoch":1430532900,"siteID":"48_201_0695","o3":56.73900,"temp":74.14400,"humid":40.76000},
{"epoch":1430533200,"siteID":"48_201_0695","o3":57.01800,"temp":73.99500,"humid":41.01800},
{"epoch":1430533500,"siteID":"48_201_0695","o3":56.56000,"temp":73.80800,"humid":41.33200},
{"epoch":1430533800,"siteID":"48_201_0695","o3":55.09200,"temp":73.64000,"humid":41.67900},
{"epoch":1430534100,"siteID":"48_201_0695","o3":56.66800,"temp":73.43300,"humid":41.71100},
{"epoch":1430534400,"siteID":"48_201_0695","o3":55.46500,"temp":73.32100,"humid":41.74800},
{"epoch":1430534700,"siteID":"48_201_0695","o3":54.79900,"temp":73.10700,"humid":41.83300},
{"epoch":1430535000,"siteID":"48_201_0695","o3":55.13500,"temp":72.91400,"humid":42.13200},
{"epoch":1430535300,"siteID":"48_201_0695","o3":55.95700,"temp":72.59800,"humid":42.56600},
{"epoch":1430535600,"siteID":"48_201_0695","o3":55.85400,"temp":72.44300,"humid":42.77900},
{"epoch":1430535900,"siteID":"48_201_0695","o3":55.18500,"temp":72.29100,"humid":43.03400},
{"epoch":1430536200,"siteID":"48_201_0695","o3":54.39000,"temp":72.10700,"humid":43.43800},
{"epoch":1430536500,"siteID":"48_201_0695","o3":54.30700,"temp":71.93800,"humid":43.78200},
{"epoch":1430536800,"siteID":"48_201_0695","o3":53.62800,"temp":71.85700,"humid":43.82100},
{"epoch":1430537100,"siteID":"48_201_0695","o3":53.52000,"temp":71.80900,"humid":43.76200},
{"epoch":1430537400,"siteID":"48_201_0695","o3":53.13600,"temp":71.79000,"humid":43.79800},
{"epoch":1430537700,"siteID":"48_201_0695","o3":52.63100,"temp":71.60000,"humid":44.29000},
{"epoch":1430538000,"siteID":"48_201_0695","o3":52.07300,"temp":71.51800,"humid":44.46100},
{"epoch":1430538300,"siteID":"48_201_0695","o3":52.36900,"temp":71.42300,"humid":44.66800},
{"epoch":1430538600,"siteID":"48_201_0695","o3":52.15200,"temp":71.38200,"humid":44.85100},
{"epoch":1430538900,"siteID":"48_201_0695","o3":51.72300,"temp":71.16700,"humid":45.55300},
{"epoch":1430539200,"siteID":"48_201_0695","o3":52.85900,"temp":71.10100,"humid":45.66900},
{"epoch":1430539500,"siteID":"48_201_0695","o3":51.93200,"temp":71.00700,"humid":45.99600},
{"epoch":1430539800,"siteID":"48_201_0695","o3":51.77200,"temp":70.90200,"humid":46.24200},
{"epoch":1430540100,"siteID":"48_201_0695","o3":50.93000,"temp":70.78300,"humid":46.62100},
{"epoch":1430540400,"siteID":"48_201_0695","o3":49.51100,"temp":70.81700,"humid":46.63600},
{"epoch":1430540700,"siteID":"48_201_0695","o3":50.33900,"temp":70.69200,"humid":46.86400},
{"epoch":1430541000,"siteID":"48_201_0695","o3":50.73100,"temp":70.68900,"humid":46.92300},
{"epoch":1430541300,"siteID":"48_201_0695","o3":51.53400,"temp":70.60200,"humid":47.14400},
{"epoch":1430541600,"siteID":"48_201_0695","o3":52.93500,"temp":70.53700,"humid":47.28000},
{"epoch":1430541900,"siteID":"48_201_0695","o3":52.73200,"temp":70.38700,"humid":47.71300},
{"epoch":1430542200,"siteID":"48_201_0695","o3":52.85600,"temp":70.26500,"humid":48.05400},
{"epoch":1430542500,"siteID":"48_201_0695","o3":53.13800,"temp":70.16000,"humid":48.36600}];
    
    // loop through each sample location and insert into the database
    _.each(sampleAirData, function(air) {
        UHMain.insert(air);
    });    
    
    UHMain._ensureIndex({epoch: 1});    
}
});
