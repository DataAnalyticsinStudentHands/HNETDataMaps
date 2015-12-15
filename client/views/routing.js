Router.configure({
    layoutTemplate: 'Frame',
    loadingTemplate: 'loading',
    notFoundTemplate: 'pageNotFound',
    yieldTemplates: {
        nav: {
            to: 'nav'
        }
    }
});

Router.route('/', {
    name: 'mainMap',
    template: 'mainMap',
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
            _id: this.params._id
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
Router.route('/admin/', {
    name: 'admin',
    template: 'admin',
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