Meteor.subscribe('ozonedata', 'UHCBH');  
/*Template.clearbrook.onCreated(function() {
    var instance = this;
    instance.autorun(function() {           
    	instance.subscribe('ozonedata', "UHCBH");            
    });
    instance.fedData = function() {    
        return OzoneData.find({}, {limit: 288});
    };
                     
});
*/
Template.clearbrook.helpers({

	chartObj: function() {
		
		//var ozoneConCursor = Template.instance.fedData();
		var ozoneCursor = OzoneData.find({}, {limit: 288});
		var ozoneConDataforGraph = [];
		ozoneCursor.forEach(function(time) {
			ozoneConDataforGraph.push({ x: parseFloat(time.TheTime),
									y: parseFloat(time.O3_conc),
									name: parseFloat(time.TheTime)/10});
		});
		
		var ozoneTempDataforGraph = [];
		ozoneCursor.forEach(function(time) {
			ozoneTempDataforGraph.push({ x: parseFloat(time.TheTime),
									y: parseFloat(time.O3_temp),
									name: parseFloat(time.TheTime)});
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