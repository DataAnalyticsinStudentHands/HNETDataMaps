

// configuration of admin interface
AdminConfig = {
  collections: {
    Sites: {
      subscription: 'sites',
      omitFields: ['_id', 'loc.type'],
      tableColumns: [{
        label: 'AQSID',
        name: 'AQSID',
      }, {
        label: 'Name',
        name: 'site name',
      }, {
        label: 'Incoming folder',
        name: 'incoming',
      }],
    },
  },
  // Use a custom SimpleSchema:
  userSchema: new SimpleSchema({
    receiveSiteStatusEmail: {
      type: Boolean,
    },
  }),
};
