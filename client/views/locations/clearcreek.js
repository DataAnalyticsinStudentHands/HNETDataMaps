
/*
Template.clearcreek.onCreated(function() {
    var instance = this;
    instance.autorun(function() {            
            instance.subscribe('ozonedata', "UHCCH");            
        });
    instance.fedData = function() {    
        return OzoneData.find({}, {sort: {epoch: -1}});
    };
                     
});
*/
Template.clearcreek.helpers({

	chartObj: function() {
		//var ozoneConCursor = OzoneData.find({'siteRef': 'UHCCH'}, {sort: {'TheTime': -1}, limit: 288});
		var ozoneCursor = OzoneData.find({}, {limit: 288});
		var ozoneConDataforGraph = [];
		ozoneCursor.forEach(function(time) {
			ozoneConDataforGraph.push({ x: parseInt(time.TheTime),
									y: parseFloat(time.O3_conc),
									name: parseInt(time.TheTime)/10});
		});
		
		var ozoneTempDataforGraph = [];
		ozoneCursor.forEach(function(time) {
			ozoneTempDataforGraph.push({ x: parseInt(time.TheTime),
									y: parseFloat(time.O3_temp),
									name: parseInt(time.TheTime)});
		});

		return {
			title: {
				text: 'Ozone Concentration and Temperature for the last 24h'
			},
			credits: {
				href: "http://hnet.uh.edu",
				text: "UH-HNET" 
			},
			legend: {
				layout: 'vertical',
				align: "left",
                verticalAlign: "top",
                floating: true,
                x: 100,
                y: 50,
                borderWidth: 1
			},
			series: [                 
                {
                    
                    type: "scatter",
                    name: "Ozone Concentration",
                    data: ozoneConDataforGraph,
                    color: '#5CA221'                    
                }
                ,
                {
                    type: "scatter",
                    name: "Ozone Temperature",
                    data: ozoneTempDataforGraph,
                    color: '#C764FC'
                }
            ]
		}
	}
});