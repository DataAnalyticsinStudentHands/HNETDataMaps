const startEpoch = new ReactiveVar(moment().subtract(1, 'days').unix()); // 24 hours ago - seconds
const endEpoch = new ReactiveVar(moment().unix());

Meteor.subscribe('sites');

Template.datamanagement.helpers({
  result() {
    return Session.get('serverDataResponse') || '';
  },
  selectedStartDate() {
    return moment.unix(startEpoch.get()).format('YYYY-MM-DD');
  },
  selectedEndDate() {
    return moment.unix(endEpoch.get()).format('YYYY-MM-DD');
  },
  startEpoch() {
    return startEpoch.get();
  },
  endEpoch() {
    return endEpoch.get();
  },
  availableSites() {
    return Sites.find();
  },
});

Template.datamanagement.events = {
  'change #startdatepicker': function (event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'change #enddatepicker': function (event) {
    endEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'click #createAggregates': function () {
    Meteor.call('new5minAggreg', $('input[type=text]').val(), $('#start').val(), $('#end').val(), function (err, response) {
      if (err) {
        Session.set('serverDataResponse', 'Error:' + err.reason);
        return;
      }
      Session.set('serverDataResponse', response);
    });
  },
};
