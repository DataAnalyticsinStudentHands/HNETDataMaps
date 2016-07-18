const startEpoch = new ReactiveVar(moment().subtract(1, 'days').unix()); // 24 hours ago - seconds
const endEpoch = new ReactiveVar(moment().unix());

Template.datamanagement.onCreated(function () {
  Meteor.subscribe('sites');
});

Template.datamanagement.helpers({
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
  'change #startdatepicker' (event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'change #enddatepicker' (event) {
    endEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'click #createAggregates' () {

    event.preventDefault();
    const site = Sites.findOne({
      siteName: $('#selectedSite').val(),
    });

    Meteor.call('new5minAggreg', site.AQSID, startEpoch.get(), endEpoch.get(),
      function (err, response) {
        if (err) {
          sAlert.error(`Error:\n ${err.reason}`);
          return;
        }
        sAlert.success(response);
      });
  },
  'click #downloadData' () {

    event.preventDefault();
    const site = Sites.findOne({
      siteName: $('#selectedSite').val(),
    });

    // call export (no push) and download
    DataExporter.getDataTCEQ(site.AQSID, startEpoch.get(), endEpoch.get(), false, true);
  },
};
