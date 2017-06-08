// Call for exporting data in certain formats and download client side
DataExporter = {
  getDataTCEQ: function(aqsid, startEpoch, endEpoch, activeOnly) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      Meteor.subscribe('liveSites');

			let fileFormat = 'tceq';
			if (!activeOnly) {
				fileFormat = 'tceq_allchannels';
			}

      // get TCEQ export formated data
      Meteor.call('exportData', aqsid, startEpoch, endEpoch, fileFormat, function(error, data) {

        if (error) {
          sAlert.error(`Error:\n ${error.reason}`);
          return false;
        }

        const site = LiveSites.findOne({ AQSID: `${aqsid}` });

        // download the data as csv file
        if (site !== undefined) {
          //const csv = Papa.unparse(data);
          console.log(data.fields)
          const csv = Papa.unparse({
            data: data.data,
            fields: data.fields
          });

          // create site name from incoming folder
          const siteName = (site.incoming.match(new RegExp('UH' +
          '(.*)' +
          '_')))[1].slice(-2);
          DataExporter._downloadCSV(csv, `${siteName.toLowerCase()}${moment().format('YYMMDDHHmmss')}.txt`);
        } else {
          resolve(data);
        }
      });
    });
  },
  _downloadCSV: function(csv, fileName) {
    const blob = new Blob([csv]);
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob, {type: 'text/csv'});
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};
