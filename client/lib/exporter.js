// Call for exporting data in certain formats and download client side
DataExporter = {
  getDataTCEQ: function(aqsid, startEpoch, endEpoch, push, download) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      Meteor.subscribe('liveSites');

      // create TCEQ export formated data and push
      Meteor.call('exportData', aqsid, startEpoch, endEpoch, push, function(error, data) {

        if (error) {
          sAlert.error(error);
          return false;
        }

        const site = LiveSites.findOne({AQSID: `${aqsid}`});

        // download the data as csv file
        if (site !== undefined && download) {
          const csv = Papa.unparse(data);

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
