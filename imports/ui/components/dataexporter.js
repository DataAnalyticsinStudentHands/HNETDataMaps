import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { LiveSites } from '../../api/collections_server';

// Call for exporting data in certain formats and download client side
export const DataExporter = {
  getDataTCEQ(aqsid, startEpoch, endEpoch, activeOnly) {
    // Return a new promise.
    return new Promise(() => {
      Meteor.subscribe('liveSites');

      let fileFormat = 'tceq';
      if (!activeOnly) {
        fileFormat = 'tceq_allchannels';
      }

      // get TCEQ export formated data
      Meteor.call('exportData', aqsid, startEpoch, endEpoch, fileFormat, (err, response) => {
        if (err) {
          sAlert.error(`Error:\n ${err.reason}`);
          return;
        }

        const site = LiveSites.findOne({ AQSID: `${aqsid}` });

        // download the data as csv file
        if (site !== undefined) {
          const csv = Papa.unparse({
            data: response.data,
            fields: response.fields
          });

          try {
            // get site name from incoming folder (TODO: take out check after we have renamed all folders)
            let siteName = (site.incoming.match(new RegExp('UH' +
                '(.*)' +
                '_')))[1].slice(-2);
            if (!(siteName === 'WL' || siteName === 'MT' || siteName === 'SP' || siteName === 'JF')) {
              siteName = site.incoming.split(/[_]+/)[1];
            }
            DataExporter._downloadCSV(csv, `${siteName.toLowerCase()}${moment().format('YYMMDDHHmmss')}.txt`);
          } catch (error) {
            sAlert.error(`Error:\n ${error.reason}`);
          }
        } else {
          sAlert.error('Error:\n Site is undefined.');
        }
      });
    });
  },
  _downloadCSV(csv, fileName) {
    const blob = new Blob([csv]);
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob, { type: 'text/csv' });
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};
