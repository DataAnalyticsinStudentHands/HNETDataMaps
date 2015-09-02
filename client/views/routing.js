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

Router.route('/clearlake', function() {
    this.render('clearlake');
});

Router.route('/clearbrook', function() {
    this.render('clearbrook');
});
Router.route('/clearcreek', function() {
    this.render('clearcreek');
});
Router.route('/about', function() {
    this.render('about');
});

