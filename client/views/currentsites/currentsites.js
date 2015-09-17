
Meteor.subscribe('LiveFeeds');

Template.currentsites.helpers({
    
	chartObj: function() {
        // need to 
		var CLcursor = LiveFeedMonitors.find({'siteRef': 'UHCLH_DAQData'});
		var CCcursor = LiveFeedMonitors.find({'siteRef': 'UHCCH_DAQData'});
		var CBcursor = LiveFeedMonitors.find({'siteRef': 'UHCBH_DAQData'});
		var CLarray;
		var CBarray;
		var CCarray;
		Tracker.autorun(function() {
			CLarray = [];
			CLcursor.forEach(function(time) {
				CLarray.push({ x: new Date(time.epoch*1000),
										y: parseFloat(time.O3_conc)});
										//name: new Date(time.epoch*1000)});
			});
		
			CBarray = [];
			CBcursor.forEach(function(time) {
				CBarray.push({ x: new Date(time.epoch*1000),
										y: parseFloat(time.O3_conc)});
			});

			CCarray = [];
			CCcursor.forEach(function(time) {
				CCarray.push({ x: new Date(time.epoch*1000),
										y: parseFloat(time.ccr_o3_conc)});
			});
		});
		return {
			chart: {
				zoomType: 'x'
			},
			title: {
				text: 'Ozone Concentration for the last 24h'
			},
			xAxis: {
                    type: 'datetime'
            },
			credits: {
				href: "http://hnet.uh.edu",
				text: "UH-HNET" 
			},
			legend: {
				layout: 'vertical',
				align: "left",
                floating: true,
                borderWidth: 1
			},
			plotOptions: {
				series: {
					dataGrouping: {
						approximation: "average"
					},
					turboThreshold: 10000,
					marker: {
                    	radius: 2
                	}
				}
			},
			series: [                 
                {                    
                    type: "scatter",
                    name: "Clear Brook",
                    data: CBarray                    
                }
                ,
                {
                    type: "scatter",
                    name: "Clear Creek",
                    data: CCarray
                }
                ,
                {
                    type: "scatter",
                    name: "Clear Lake",
                    data: CLarray
                }
            ]
		};
	last}
});

