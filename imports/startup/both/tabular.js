import { Tabular } from 'meteor/aldeed:tabular';

import { LiveSites, Exports } from '../../api/collections_server';
import { AggrEdits } from '../../api/collections_client';

// TabularTables = {};

new Tabular.Table({
  name: 'Edits',
  collection: AggrEdits,
  order: [
    [0, "desc"]
  ],
  columns: [
    {
      data: 'editEpoch',
      title: 'Edit Timestamp',
      render: function (val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
      }
    }, {
      data: 'site',
      title: 'Site',
      render: function (val, type, doc) {
        return LiveSites.findOne({ AQSID: val }).siteName;
      }
    }, {
      data: 'startEpoch',
      title: 'Start Period',
      render: function(val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
      }
    }, {
      data: 'endEpoch',
      title: 'End Period',
      render: function(val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
      }
    }, {
      data: 'instrument',
      title: 'Instrument'
    }, {
      data: 'flag',
      title: 'New Flag'
    }, {
      data: 'note',
      title: 'Note'
    }, {
      data: 'user',
      title: 'Editor'
    }, {
      title: 'View Edits',
      tmpl: Meteor.isClient && Template.viewEditsCell
    }, {
      title: 'Last Pushed',
      tmpl: Meteor.isClient && Template.viewDataCell,
      tmplContext: function (rowData) {
        return { item: rowData };
      }
    }
  ],
  extraFields: ['fileName']
});

new Tabular.Table({
  name: 'AutomaticPushes',
  collection: Exports,
  skipCount: true,
  pagingType: 'simple',
  info: false,
  order: [
    [0, "desc"]
  ],
  columns: [
    {
      data: 'pushEpoch',
      title: 'Push Timestamp',
      render: function(val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
      }
    }, {
      data: 'site',
      title: 'Site',
      render: function(val, type, doc) {
        const selectedSite = LiveSites.findOne({AQSID: val});
        return selectedSite.siteName;
      }
    }, {
      data: 'startEpoch',
      title: 'Start Period',
      render: function(val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
      }
    }, {
      data: 'endEpoch',
      title: 'End Period',
      render: function(val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
      }
    }, {
      title: 'View File',
      width: '10%',
      tmpl: Meteor.isClient && Template.viewDataCell,
      tmplContext: function (rowData) {
        return { item: rowData };
      }
    }
  ],
  extraFields: ['fileName', 'manual']
});

new Tabular.Table({
  name: 'ManualPushes',
  collection: Exports,
  order: [
    [0, "desc"]
  ],
  columns: [
    {
      data: 'pushEpoch',
      title: 'Push Timestamp',
      render: function(val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
      }
    }, {
      data: 'site',
      title: 'Site',
      render: function(val, type, doc) {
        const selectedSite = LiveSites.findOne({AQSID: val});
        return selectedSite.siteName;
      }
    }, {
      data: 'startEpoch',
      title: 'Start Period',
      render: function(val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
      }
    }, {
      data: 'endEpoch',
      title: 'End Period',
      render: function(val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
      }
    }, {
      title: 'View File',
      width: '10%',
      tmpl: Meteor.isClient && Template.viewDataCell,
      tmplContext: function (rowData) {
        return { item: rowData };
      }
    }
  ],
  extraFields: ['fileName', 'manual']
});

new Tabular.Table({
  name: 'Status',
  collection: LiveSites,
  paging: false,
  info: false,
  searching: false,
  limit: 20,
  columns: [
    {
      data: 'siteName',
      title: 'Site Name'
    }, {
      data: 'lastUpdateEpoch',
      title: 'Last Update',
      render: function(val, type, doc) {
        return moment.unix(val).format('YYYY/MM/DD HH:mm');
      }
    }, {
      data: 'lastPushEpoch',
      title: 'Last Push',
			tmpl: Meteor.isClient && Template.pushStatusCell,
      tmplContext: function (rowData) {
        return { item: rowData };
      }
    }
  ],
  extraFields: ['siteGroup', 'TCEQPushing'],
  selector() {
    return { status: 'Active' };
  }
});
