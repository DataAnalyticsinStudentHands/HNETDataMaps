import '../styles.css';
import '../sb-admin-2.css';
import './footer.html';
import './layout.html';
import './loading.html';
import './nav.html';

import { LiveSites } from '../../api/collections_server';

Meteor.subscribe('liveSites');

Template.navItems.helpers({
  activeIfTemplateIs(template) {
    const currentRoute = Router.current();
    return currentRoute && template === currentRoute.lookupTemplate()
      ? 'active'
      : '';
  },
  sites() {
    return LiveSites.find({ $and: [
        { status: 'Active' },
        { siteGroup: 'HNET' }]
    });
  },
  bc2sites() {
    return LiveSites.find({ $and: [
        { status: 'Active' },
        { siteGroup: 'BC2' }]
    });
  },
  rambollsites() {
    return LiveSites.find({ $and: [
        { status: 'Active' },
        { siteGroup: 'Ramboll' }]
    });
  },
  go3sites() {
    return LiveSites.find({ $and: [
        { status: 'Active' },
        { siteGroup: 'GO3' }]
    });
  },
  histsites() {
    return LiveSites.find({ $and: [
        { status: 'Inactive' },
        { siteGroup: 'HNET' }]
    });
  },
  histbc2sites() {
    return LiveSites.find({ $and: [
        { status: 'Inactive' },
        { siteGroup: 'BC2' }]
    });
  },
  histrambollsites() {
    return LiveSites.find({ $and: [
        { status: 'Inactive' },
        { siteGroup: 'Ramboll' }]
    });
  },
  histgo3sites() {
    return LiveSites.find({ $and: [
        { status: 'Inactive' },
        { siteGroup: 'GO3' }]
    });
  }
});

Template.footer.helpers({
  siteSpecific() {
    const site = LiveSites.findOne({ AQSID: Router.current().params._id });
    return site && site.footerText;
  }
});
