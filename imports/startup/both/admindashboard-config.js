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

AdminDashboard.addCollectionItem(function(collection, path) {
  if (collection === 'LiveSites') {
    return {
      title: 'Troubleshoot',
      url: path + '/fixSites'
    };
  }
});

AdminDashboard.addSidebarItem('Version', AdminDashboard.path('versionInfo'), { icon: 'info' });

sAlert.config({
  effect: '',
  position: 'top-right',
  timeout: 5000,
  html: false,
  onRouteClose: true,
  stack: true,
  // or you can pass an object:
  // stack: {
  //     spacing: 10 // in px
  //     limit: 3 // when fourth alert appears all previous ones are cleared
  // }
  offset: 50, // in px - will be added to first alert (bottom or top - depends of the position in config)
  beep: false,
  // examples:
  // beep: '/beep.mp3'  // or you can pass an object:
  // beep: {
  //     info: '/beep-info.mp3',
  //     error: '/beep-error.mp3',
  //     success: '/beep-success.mp3',
  //     warning: '/beep-warning.mp3'
  // }
  onClose: _.noop, //
  // examples:
  // onClose: function() {
  //     /* Code here will be executed once the alert closes. */
  // }
});
