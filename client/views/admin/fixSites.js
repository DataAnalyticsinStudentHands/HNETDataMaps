Template.fixSites.helpers({
  availableSites() {
    return LiveSites.find();
  }
});

Template.fixSites.events = {
  'click #resetLastPush'(event) {
    event.preventDefault();
    const site = LiveSites.findOne({ siteName: $('#selectedSite').val() });

    Meteor.call('resetLastPushDate', site.AQSID, (err, response) => {
      if (err) {
        sAlert.error(`Error:\n ${err.reason}`);
        return;
      }
      sAlert.success('Reset successful!');
    });
  }
};
