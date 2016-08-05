// schema for the LiveSites collection, used in admin UI
SitesSchema = new SimpleSchema({
  AQSID: {
    type: String,
    label: 'AQSID:',
    max: 10,
  },
  parameters: {
    type: Array,
  },
  'parameters.$': {
    type: Object,
  },
  'parameters.$.parameter name': {
    type: String,
    label: 'Parameter Name:',
  },
  'loc.type': {
    type: String,
    autoValue: function () {
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
  'siteName': {
    type: String,
    label: 'Site Name:',
    max: 100
  },
  'agencyID': {
    type: String
  },
  country: {
    type: String
  },
  state: {
    type: String
  },
  elevation: {
    type: String
  },
  status: {
    type: String,
    max: 10,
    autoform: {
      options: [{
        label: 'Active',
        value: 'Active'
      }, {
        label: 'Inactive',
        value: 'Inactive'
      }]
    }
  }
});

LiveSites.attachSchema(SitesSchema);


// configuration of admin interface
AdminConfig = {
  collections: {
    LiveSites: {
      icon: 'pencil',
      omitFields: ['_id', 'loc.type'],
      tableColumns: [{
        label: 'AQSID',
        name: 'AQSID',
      }, {
        label: 'Name',
        name: 'siteName',
      }, {
        label: 'Incoming folder',
        name: 'incoming',
      }],
    },
  },
  // custom SimpleSchema for users
  userSchema: new SimpleSchema({
    receiveSiteStatusEmail: {
      type: Boolean,
    },
  }),
};
