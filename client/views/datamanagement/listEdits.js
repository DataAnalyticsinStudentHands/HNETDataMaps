Template.listEdits.onCreated(function() {
  this.subscribe('editedPoints');
});

Template.listEdits.helpers({
  siteName(site) {
    const selectedSite = Sites.findOne({
      AQSID: site,
    });
    return selectedSite.siteName;
  },
});

Template.listEdits.helpers({
  points() {
    return EditedPoints.find();
  },
});
