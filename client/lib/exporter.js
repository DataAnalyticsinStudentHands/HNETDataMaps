//Exporting data in certain formats and download client side
DataExporter = {
	exportForTCEQ: function(siteId, startEpoch, endEpoch) {
		var self = this;
		Meteor.call("exportData", siteId, startEpoch, endEpoch, function(error, data) {

			if ( error ) {
				alert(error); 
				return false;
			}
			
			var csv = Papa.unparse(data);
			self._downloadCSV(csv);
		});
	},

	_downloadCSV: function(csv) {
		var blob = new Blob([csv]);
		var a = window.document.createElement("a");
	    a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
	    a.download = "test.csv";
	    document.body.appendChild(a);
	    a.click();
	    document.body.removeChild(a);
	}
};