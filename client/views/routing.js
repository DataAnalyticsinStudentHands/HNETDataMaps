Router.route('/', function() {
    this.render('map');
});

Router.route('/home', function() {
    this.render('map');
});

Router.route('/maincampus', function() {
    this.render('maincampus');
});

Router.route('/history', function() {
    this.render('history');
});

Router.route('/currentsites', function() {
    this.render('currentsites');
});


