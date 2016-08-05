const startEpoch = new ReactiveVar(moment().subtract(1, 'days').unix()); // 24 hours ago - seconds
const endEpoch = new ReactiveVar(moment().unix());

Template.datamanagement.onCreated(function () {
  Meteor.subscribe('liveSites');
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
    return LiveSites.find();
  },
});

Template.datamanagement.events = {
  'change #startdatepicker' (event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'change #enddatepicker' (event) {
    endEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
  },
  'click #createAggregates' (event, target) {
    event.preventDefault();
    const site = LiveSites.findOne({
      siteName: $('#selectedSite').val(),
    });

    const start = target.$('form.management input[name=start]').val();
    const end = target.$('form.management input[name=end]').val();

    Meteor.call('new5minAggreg', site.AQSID, start, end,
      function (err, response) {
        if (err) {
          sAlert.error(`Error:\n ${err.reason}`);
          return;
        }
        sAlert.success(response);
      });
  },
  'click #downloadData'(event, target) {
    event.preventDefault();
    const site = LiveSites.findOne({
      siteName: $('#selectedSite').val(),
    });

    const start = target.$('form.management input[name=start]').val();
    const end = target.$('form.management input[name=end]').val();

    // call export (no push) and download
    DataExporter.getDataTCEQ(site.AQSID, start, end, false, true);
  },
};
