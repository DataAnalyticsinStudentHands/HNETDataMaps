Router.configure({
  layoutTemplate: 'layout' // whole template fra
});

Router.route('/', {
  name: 'home',
  template: 'home',
  data: function() {
    mapCollectionDistance = new ReactiveVar();
    mapCollectionDistance.set(1200);
    mapCollectionNumberVis = new ReactiveVar();
    mapCollectionNumberVis.set(10);
  },
  action: function() {
    this.render();
  }
});
Router.route('site', {
  path: '/site/:_id',
  data: function() {
    return LiveSites.findOne({AQSID: this.params._id});
  },
  template: 'site'
});
Router.route('/composite/', {
  name: 'composite',
  template: 'composite',
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
Router.route('/listPushes/', {
  name: 'listPushes',
  template: 'listPushes',
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

Router.route('fixSites', {
  path: AdminDashboard.path('LiveSites/fixSites'),
  controller: 'AdminController',
  onAfterAction: function() {
    Session.set('admin_title', 'Troubleshooting for Sites');
  }
});

Router.plugin('ensureSignedIn', {
  only: ['site', 'composite', 'admin']
});

// AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
// AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');
