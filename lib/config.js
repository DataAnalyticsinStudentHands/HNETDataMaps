// JSLint options:
/* global SitesSchema, AdminConfig */

// schema for the LiveSites collection, used in admin UI
SitesSchema = new SimpleSchema({
  siteName: {
    type: String,
    label: 'Site Name',
    max: 100
  },
  AQSID: {
    type: String,
    label: 'AQSID',
    max: 10
  },
  Channels: {
    type: Array
  },
  'Channels.$': {
    type: Object,
    optional: true
  },
  'Channels.$.Name': {
    type: String,
    optional: true,
    label: 'Channel Name:'
  },
  'Channels.$.Header': {
    type: String,
    optional: true,
    label: 'Channel Header:'
  },
  'Channels.$.Status': {
    type: String,
    optional: true,
    label: 'Channel Status:',
    max: 10,
    autoform: {
      options: [
        {
          label: 'Active',
          value: 'Active'
        }, {
          label: 'Inactive',
          value: 'Inactive'
        }
      ]
    }
  },
  'loc.type': {
    type: String,
    autoValue: function() {
      return 'Point';
    }
  },
  'loc.coordinates': {
    type: [Number],
    decimal: true,
    label: 'Coordinates array'
  },
  'GMT offset': {
    type: String
  },
  'site code': {
    type: String
  },
  agencyID: {
    type: String
  },
  country: {
    type: String
  },
  state: {
    type: String
  },
	city: {
		label: 'City',
    type: String
  },
  elevation: {
    type: String,
    optional: true
  },
	'externalLink.href': {
    type: String,
    label: 'href, e.g. http://site.com/page'
  },
	'externalLink.name': {
    type: String,
    label: 'Label'
  },
  status: {
    type: String,
    max: 10,
    autoform: {
      options: [
        {
          label: 'Active',
          value: 'Active'
        }, {
          label: 'Inactive',
          value: 'Inactive'
        }
      ]
    }
  },
  statusCheckInterval: {
    label: 'Status Check Interval [minutes]',
    type: Number
  },
  incoming: {
    type: String
  },
  lastPushEpoch: {
    type: SimpleSchema.Integer
  },
  lastUpdateEpoch: {
    type: SimpleSchema.Integer
  },
  footerText: {
    label: 'Footer Text',
    optional: true,
    type: String
  },
  compositeColor: {
    label: 'Color used in Composite Plot [#HEX]',
    type: String
  }
});

LiveSites.attachSchema(SitesSchema);

// configuration of admin interface
AdminConfig = {
  skin: 'black-light',
  collections: {
    LiveSites: {
      icon: 'home',
      color: 'green',
      omitFields: [
        '_id', 'loc.type'
      ],
      tableColumns: [
        {
          label: 'AQSID',
          name: 'AQSID'
        }, {
          label: 'Name',
          name: 'siteName'
        }, {
          label: 'Incoming folder',
          name: 'incoming'
        }, {
          label: 'Status',
          name: 'status'
        }, {
          label: 'Last Push',
          name: 'lastPushEpoch'
        }, {
          label: 'Last Update',
          name: 'lastUpdateEpoch'
        }
      ]
    }
  },
  // custom SimpleSchema for users
  userSchema: new SimpleSchema({
    receiveSiteStatusEmail: {
      type: Boolean
    }
  })
};
