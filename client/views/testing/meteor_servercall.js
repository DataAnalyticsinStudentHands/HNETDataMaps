var startEpoch = new ReactiveVar(moment().subtract(1, 'days').unix()); //24 hours ago - seconds
var endEpoch = new ReactiveVar(moment().unix());

//simple template to test server functions
Template.passData.helpers({
    result: function () {
        return Session.get('serverDataResponse') || '';
    },
    selectedStartDate: function () {
        return moment.unix(startEpoch.get()).format('YYYY-MM-DD');
    },
    selectedEndDate: function () {
        return moment.unix(endEpoch.get()).format('YYYY-MM-DD');
    },
    startEpoch: function () {
        return startEpoch.get();
    },
    endEpoch: function () {
        return endEpoch.get();
    }

});

Template.passData.events = {
    'change #startdatepicker': function (event) {
        startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
    },
    'change #enddatepicker': function (event) {
        endEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
    },
    'click #passDataResult': function () {
        Meteor.call('new5minAggreg', $('input[type=text]').val(), $('#start').val(), $('#end').val(), function (err, response) {
            if (err) {
                Session.set('serverDataResponse', 'Error:' + err.reason);
                return;
            }
            Session.set('serverDataResponse', response);
        });
    }
};