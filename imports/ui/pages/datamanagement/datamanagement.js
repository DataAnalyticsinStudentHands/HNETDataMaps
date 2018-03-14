import { LiveSites } from '../../../api/collections_both';
import { DataExporter } from '../../components/dataexporter';

import './datamanagement.html';

const startEpoch = new ReactiveVar(moment().subtract(1, 'days').unix()); // 24 hours ago - seconds
const endEpoch = new ReactiveVar(moment().unix());

Template.datamanagement.onCreated(function() {
  Meteor.subscribe('liveSites');
});

Template.datamanagement.helpers({
  selectedStartDate() {
    return moment.unix(startEpoch.get()).format('YYYY-MM-DD');
  },
  selectedEndDate() {
    return moment.unix(endEpoch.get()).format('YYYY-MM-DD');
  },
  startEpoch() {
    return startEpoch.get();
  },
  endEpoch() {
    return endEpoch.get();
  },
  availableSites() {
    return LiveSites.find();
  }
});

Template.datamanagement.events = {
  'change #startdatepicker'(event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'change #enddatepicker'(event) {
    endEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'click #createAggregates'(event, target) {
    event.preventDefault();
    const site = LiveSites.findOne({ siteName: $('#selectedSite').val() });

    const start = target.$('form.management input[name=start]').val();
    const end = target.$('form.management input[name=end]').val();

    Meteor.call('new5minAggreg', site.AQSID, start, end, function(err, response) {
      if (err) {
        sAlert.error(`Error:\n ${err.reason}`);
        return;
      }
      sAlert.success('Called Creating Aggregates!');
    });
  },
  'click #downloadData'(event, target) {
    event.preventDefault();
    const site = LiveSites.findOne({ siteName: $('#selectedSite').val() });

    const start = target.$('form.management input[name=start]').val();
    const end = target.$('form.management input[name=end]').val();

    // call export for all channels and download
    DataExporter.getDataTCEQ(site.AQSID, start, end, false);
  },
  'click #downloadActiveData'(event, target) {
    event.preventDefault();
    const site = LiveSites.findOne({ siteName: $('#selectedSite').val() });

    const start = target.$('form.management input[name=start]').val();
    const end = target.$('form.management input[name=end]').val();

    // call export for active channels and download
    DataExporter.getDataTCEQ(site.AQSID, start, end, true);
  },
  'click #pushData'(event, target) {
    event.preventDefault();
    const site = LiveSites.findOne({ siteName: $('#selectedSite').val() });

    const start = target.$('form.management input[name=start]').val();
    const end = target.$('form.management input[name=end]').val();

    // call push data to TCEQ
    Meteor.call('pushData', site.AQSID, start, end, true, (err, response) => {
      if (err) {
        sAlert.error(`Error:\n ${err.reason}`);
        return;
      }
      sAlert.success(`Pushed file\n ${response} successfull!`);
    });
  },
  'click #deleteAggregates'(event, target) {
    event.preventDefault();
    const site = LiveSites.findOne({ siteName: $('#selectedSite').val() });

    const start = target.$('form.management input[name=start]').val();
    const end = target.$('form.management input[name=end]').val();

    // call to delete aggreagtes
    Meteor.call('deleteAggregates', site.AQSID, start, end, (err, response) => {
      if (err) {
        sAlert.error(`Error:\n ${err.reason}`);
        return;
      }
      sAlert.success(`Deleted:\n ${response} aggregated data points`);
    });
  }
};
