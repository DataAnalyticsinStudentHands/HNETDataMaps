import { LiveSites } from '../../api/collections_server';

// configuration of admin interface
AdminConfig = {
  skin: 'black-light',
  collections: {
    LiveSites: {
      collectionObject: LiveSites,
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
          label: 'Site Group',
          name: 'siteGroup'
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
