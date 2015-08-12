Router.route('/', function() {
    this.render('map');
});

Router.route('/maincampus', function() {
    this.render('maincampus');
});

Router.route('/sugarland', function() {
    this.render('sugarland');
});

Router.route('/coastalcenter', function() {
    this.render('coastalcenter');
});

Router.route('/libertyairport', function() {
    this.render('libertyairport');
});

Router.route('/jonesstate', function() {
    this.render('jonesstate');
});

Router.route('/history', function() {
    this.render('history');
});
