// Call for exporting data in certain formats and download client side
DataExporter = {
  exportForTCEQ: function (aqsid, startEpoch, endEpoch, push) {
    var self = this;
    Meteor.subscribe('sites');

		// create TCEQ export formated data and push
    Meteor.call('exportData', aqsid, startEpoch, endEpoch, push, function (error, data) {

      if (error) {
        alert(error);
        return false;
      }

      const site = Sites.findOne({
        AQSID: aqsid,
      });

			// download the data as csv file
      if (site !== undefined) {
        const csv = Papa.unparse(data);
        const siteName = (site.incoming.match(new RegExp('UH' + '(.*)' + '_')))[1].slice(-2); // create site name from incoming folder
        self._downloadCSV(csv, `${siteName.toLowerCase()}${moment().format('YYMMDDHHmmss')}.txt`);
      }
    });
  },

  _downloadCSV: function (csv, fileName) {
    const blob = new Blob([csv]);
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob, {
      type: 'text/csv',
    });
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};
