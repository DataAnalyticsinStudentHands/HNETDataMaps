import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { LiveSites } from '../../../api/collections_server';
import { DataExporter } from '../../components/dataexporter';

import './datamanagement.html';

const startEpoch = new ReactiveVar(moment().subtract(1, 'days').unix()); // 24 hours ago - seconds
const endEpoch = new ReactiveVar(moment().unix());

Template.datamanagement.onCreated(function () {
  Meteor.subscribe('liveSites');
});

Template.datamanagement.onRendered(function () {
  // setup date picker for reimport data
  this.$('#datetimepicker1').datetimepicker({
    format: 'MM/DD/YYYY',
    widgetPositioning: {
      horizontal: 'left',
      vertical: 'auto'
    }
  });
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
  },
  availableBC2Sites() {
    return LiveSites.find({ siteGroup: 'BC2' });
  },
  availableRambollSites() {
    return LiveSites.find({ siteGroup: 'Ramboll' });
  },
  availableGo3Sites() {
    return LiveSites.find({ siteGroup: 'GO3' });
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

    Meteor.call('create5minAggregates', site.AQSID, start, end, function(err, response) {
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
  },
  'click #reimportLiveData'(event, target) {
    event.preventDefault();
    const site = LiveSites.findOne({ siteName: $('#selectedSite').val() });
    const selectedDate = target.$('#selectedDate').val();
    const selectedType = target.$('#selectedType').val();

    // call to reimport Live data files
    Meteor.call('reimportLiveData', site.incoming, selectedDate, selectedType, (err, response) => {
      if (err) {
        sAlert.error(`Error:\n ${err.reason}`);
        return;
      }
      sAlert.success(`Import:\n ${response} live data points`);
    });
  }
};
