import { Router } from 'meteor/iron:router';

import '../../ui/layouts/layout';
import '../../ui/pages/about/about';
import '../../ui/pages/admin/fixSites';
import '../../ui/pages/composite/composite';
import '../../ui/pages/composite/compositeCampus';
import '../../ui/pages/datamanagement/datamanagement';
import '../../ui/pages/datamanagement/listEdits';
import '../../ui/pages/datamanagement/listAutomaticPushes';
import '../../ui/pages/datamanagement/listManualPushes';
import '../../ui/pages/home/home';
import '../../ui/pages/public/public';
import '../../ui/pages/site/site';
import '../../ui/pages/bc2site/bc2site';

import '../../ui/pages/admin/versionInfo.html';
import '../../ui/pages/about/project.html';

import { LiveSites, AggrData } from '../../api/collections_both';

Router.configure({
  layoutTemplate: 'layout' // whole template fra
});

Router.route('/', {
  name: 'home',
  template: 'home',
  waitOn: function () {
    return Meteor.subscribe('liveSites');
  },
  data: function () {
		return LiveSites.find({ status: 'Active' });
	},
  action: function() {
    if (this.ready())
      // if the sub handle returned from waitOn ready() method returns
      // true then we're ready to go ahead and render the page.
      this.render()
    else
      // otherwise render the loading template.
      this.render('Loading');
  }
});
Router.route('site', {
  path: '/site/:_id',
  template: 'public',
  waitOn: function() {
        return [
        Meteor.subscribe('aggregatedata5min', this.params._id)];
  },
  data: function() {
    return {
      site: LiveSites.findOne({ AQSID: this.params._id }),
      currentData: AggrData.findOne({ site: this.params._id }) }
  },
  action: function() {
    const start = Router.current().params.query.startEpoch;
    if (start) {
      this.state.set('fromRouter', (start));
    } else {
      this.state.set('fromRouter', moment().subtract(1440, 'minutes').unix());
    }
    this.render();
  }
});

Router.route('hnetsite', {
  path: '/hnetsite/:_id',
  data: function() {
    return LiveSites.findOne({ AQSID: this.params._id });
  },
  template: 'site',
  action: function() {
    const start = Router.current().params.query.startEpoch;
    if (start) {
      this.state.set('fromRouter', (start));
    } else {
      this.state.set('fromRouter', moment().subtract(1440, 'minutes').unix());
    }
    this.render();
  }
});

Router.route('bc2site', {
  path: '/bc2site/:_id',
  data: function() {
    return LiveSites.findOne({ AQSID: this.params._id });
  },
  template: 'bc2site',
  action: function() {
    const start = Router.current().params.query.startEpoch;
    if (start) {
      this.state.set('fromRouter', (start));
    } else {
      this.state.set('fromRouter', moment().subtract(1440, 'minutes').unix());
    }
    this.render();
  }
});

Router.route('/composite/', {
  name: 'composite',
  template: 'composite',
  action: function() {
    this.render();
  }
});
Router.route('/compositeCampus/', {
  name: 'compositeCampus',
  template: 'compositeCampus',
  action: function() {
    this.render();
  }
});
Router.route('/listEdits/', {
  name: 'listEdits',
  template: 'listEdits',
  action: function() {
    this.render();
  }
});
Router.route('/listAutomaticPushes/', {
  name: 'listAutomaticPushes',
  template: 'listAutomaticPushes',
  action: function() {
    this.render();
  }
});
Router.route('/listManualPushes/', {
  name: 'listManualPushes',
  template: 'listManualPushes',
  action: function() {
    this.render();
  }
});
Router.route('/datamanagement/', {
  name: 'datamanagement',
  template: 'datamanagement',
  action: function() {
    this.render();
  }
});
Router.route('about', {
  path: '/about/:_id',
  data: function() {
    return LiveSites.findOne({AQSID: this.params._id});
  },
  template: 'about',
  action: function() {
    const start = Router.current().params.query.startEpoch;
    if (start) {
      this.state.set('fromRouter', (start));
    } else {
      this.state.set('fromRouter', moment().subtract(4320, 'minutes').unix());
    }
    this.render();
  }
});
Router.route('project', {
  name: 'project',
  template: 'project',
  action: function() {
    this.render();
  }
});

Router.route('fixSites', {
  path: AdminDashboard.path('LiveSites/fixSites'),
  controller: 'AdminController',
  onAfterAction: function() {
    Session.set('admin_title', 'Troubleshooting for Sites');
  }
});

Router.route('versionInfo', {
  path: AdminDashboard.path('versionInfo'),
  controller: 'AdminController',
  onAfterAction: function() {
    Session.set('admin_title', 'Version Information');
  }
});

Router.plugin('ensureSignedIn', {
  only: ['hnetsite', 'bc2site', 'composite', 'admin']
});

// AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
// AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');
