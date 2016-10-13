TabularTables = {};

TabularTables.Edits = new Tabular.Table({
  name: 'Edits',
  collection: AggrEdits,
  columns: [{
    data: 'editEpoch',
    title: 'Edit Timestamp',
    render: function (val, type, doc) {
      return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
    },
  }, {
    data: 'site',
    title: 'Site',
    render: function (val, type, doc) {
      const selectedSite = LiveSites.findOne({
        AQSID: val,
      });
      return selectedSite.siteName;
    },
	},
		{
	    data: 'startEpoch',
	    title: 'Start Period',
	    render: function (val, type, doc) {
	      return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
	    },
	  },
		{
	    data: 'endEpoch',
	    title: 'End Period',
	    render: function (val, type, doc) {
	      return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
	    },
  }, {
    data: 'instrument',
    title: 'Instrument',
  }, {
    data: 'flag',
    title: 'New Flag',
  }, {
    data: 'note',
    title: 'Note',
  }, {
    data: 'user',
    title: 'Editor',
  }, {
    tmpl: Meteor.isClient && Template.viewEditsCell
  }, ]
});

TabularTables.Pushes = new Tabular.Table({
  name: 'Pushes',
  collection: Exports,
  columns: [{
    data: 'pushEpoch',
    title: 'Push Timestamp',
    render: function (val, type, doc) {
      return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
    },
  }, {
    data: 'site',
    title: 'Site',
    render: function (val, type, doc) {
      const selectedSite = LiveSites.findOne({
        AQSID: val,
      });
      return selectedSite.siteName;
    },
	},
		{
	    data: 'startEpoch',
	    title: 'Start Period',
	    render: function (val, type, doc) {
	      return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
	    },
	  },
		{
	    data: 'endEpoch',
	    title: 'End Period',
	    render: function (val, type, doc) {
	      return moment.unix(val).format('YYYY/MM/DD HH:mm:ss');
	    },
  },  {
    tmpl: Meteor.isClient && Template.viewDataCell
  }, ]
});
