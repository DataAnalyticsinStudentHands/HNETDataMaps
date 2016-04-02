//Exporting data in certain formats and download client side
DataExporter = {
    exportForTCEQ: function (siteId, startEpoch, endEpoch) {
        var self = this;
        Meteor.subscribe('sites');
        Meteor.call("exportData", siteId, startEpoch, endEpoch, function (error, data) {

            if (error) {
                alert(error);
                return false;
            }

            var dir = Sites.findOne({
                AQSID: siteId
            });

            if (dir !== undefined) {
                var csv = Papa.unparse(data);
                var siteName = dir.incoming.match(/[^_]*/);
                self._downloadCSV(csv, siteName + startEpoch + endEpoch + '.txt');
            }
        });
    },

    _downloadCSV: function (csv, fileName) {
        var blob = new Blob([csv]);
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, {
            type: "text/plain"
        });
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};