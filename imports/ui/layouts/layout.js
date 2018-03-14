import '../styles.css';
import './footer.html';
import './layout.html';
import './loading.html';
import './nav.html';

import { LiveSites } from '../../api/collections_both';

Meteor.subscribe('liveSites');

Template.navItems.helpers({
  activeIfTemplateIs(template) {
    const currentRoute = Router.current();
    return currentRoute && template === currentRoute.lookupTemplate()
      ? 'active'
      : '';
  },
  sites() {
    return LiveSites.find({ status: 'Active' });
  }
});

Template.footer.helpers({
  siteSpecific() {
    const site = LiveSites.findOne({ AQSID: Router.current().params._id });
    return site && site.footerText;
  }
});
