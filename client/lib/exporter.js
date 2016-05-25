// Exporting data in certain formats and download client side
DataExporter = {
  exportForTCEQ: function (siteId, startEpoch, endEpoch) {
    var self = this;
    Meteor.subscribe('sites');
    Meteor.call('exportData', siteId, startEpoch, endEpoch, function (error, data) {

      if (error) {
        alert(error);
        return false;
      }

      var dir = Sites.findOne({
        AQSID: siteId
      });

      if (dir !== undefined) {
        const csv = Papa.unparse(data);
        const siteName = (dir.incoming.match(new RegExp('UH' + '(.*)' + '_')))[1].slice(-2); // create site name from incoming folder
        self._downloadCSV(csv, `${siteName.toLowerCase()}${moment.unix(startEpoch).format('YYMMDDHHmmss')}.txt`);
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
