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
  // setup date picker
  this.$("#datetimepicker1").datetimepicker({
    format: "MM/DD/YYYY",
    widgetPositioning: {
      horizontal: "left",
      vertical: "auto",
    },
  });
  // setup date picker
  this.$("#datetimepicker2").datetimepicker({
    format: "MM/DD/YYYY",
    widgetPositioning: {
      horizontal: "left",
      vertical: "auto",
    },
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
  },
  availableBoemSites() {
    return LiveSites.find({ siteGroup: 'BOEM' });
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

    // get selected site and dates
    const site = LiveSites.findOne({ siteName: $('#selectedSite').val() });
    const selectedImportStartEpoch = moment(target.$('#selectedImportStartDate').val(), "MM/DD/YYYY").unix();
    const selectedImportEndEpoch = moment(target.$('#selectedImportEndDate').val(), "MM/DD/YYYY").unix();

    if (Number.isNaN(selectedImportStartEpoch)) {
      sAlert.error(`Please select a Import Start date.`);
      return;
    }

    if (Number.isNaN(selectedImportEndEpoch)) {
      sAlert.error(`Please select a Import End date.`);
      return;
    }

    // get selected settings for overwrite
    let selectedOverwriteLive = false;
    let selectedOverwriteAggregate = true;

    if (target.$('#selectedOverwriteLive').is(":checked"))
    {
      selectedOverwriteLive = true;
    } else {
      selectedOverwriteLive = false;
    }
    if (target.$('#selectedOverwriteAggregate').is(":checked"))
    {
      selectedOverwriteAggregate = true;
    } else {
      selectedOverwriteAggregate = false;
    }

    // call to submit import data job
    Meteor.call('reimportLiveData', site.AQSID, selectedImportStartEpoch, selectedImportEndEpoch, selectedOverwriteLive, selectedOverwriteAggregate, (err, response) => {
      if (err) {
        sAlert.error(`Error:\n ${err.reason}`);
        return;
      }
      sAlert.success(`Import job submitted \n ${response}`);
    });
  }
};
