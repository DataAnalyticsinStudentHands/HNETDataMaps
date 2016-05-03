import Highcharts from 'highcharts';

var startEpoch = new ReactiveVar(moment().subtract(1, 'days').unix()); // 24 hours ago - seconds
var endEpoch = new ReactiveVar(moment().unix());

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

// placeholder for dynamic chart containers
var Charts = new Meteor.Collection(null); // This will store our synths

Template.registerHelper('formatDate', function (epoch) {
  return moment(epoch).format('YYYY/MM/DD HH:mm:ss');
});

Template.composite.helpers({
  selectedDate: moment.unix(startEpoch.get()).format('YYYY-MM-DD'),
  charts: function () {
    return Charts.find(); // This gives data to the html below
  }
});

Template.composite.events({
  'change #datepicker': function (event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
    endEpoch.set(moment.unix(startEpoch.get()).add(1, 'days').unix()); // always to current?
  }
});
