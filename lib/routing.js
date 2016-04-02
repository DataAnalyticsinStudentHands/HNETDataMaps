Router.configure({
    layoutTemplate: 'Frame', //whole template frame
    loadingTemplate: 'loading',
    notFoundTemplate: 'pageNotFound',
    yieldTemplates: {
        nav: {
            to: 'nav'
        }
    }
});

Router.route('/', {
    name: 'home',
    template: 'home',
    data: function () {
        mapCollectionDistance = new ReactiveVar();
        mapCollectionDistance.set(1200);
        mapCollectionNumberVis = new ReactiveVar();
        mapCollectionNumberVis.set(10);
    },
    action: function () {
        this.render();
    }
});
Router.route('site', {
    path: '/site/:_id',
    data: function () {
        return Sites.findOne({
            AQSID: this.params._id
        });
    },
    template: 'site'
});
Router.route('/composite/', {
    name: 'composite',
    template: 'composite',
    action: function () {
        this.render();
    }
});
Router.route('/testing/', {
    name: 'testing',
    template: 'passData',
    action: function () {
        this.render();
    }
});

Router.plugin('ensureSignedIn', {
    only: ['site', 'composite', 'admin']
});

//AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
//AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');