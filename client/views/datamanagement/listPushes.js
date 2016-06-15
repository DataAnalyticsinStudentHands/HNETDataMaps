Meteor.subscribe('exports');
Meteor.subscribe('sites');

Template.listPushes.events({
  'click .table' (event, instance) {
    DataExporter.exportForTCEQ(instance.$('i').data('site'), instance.$('i').data('start'), instance.$('i').data('end'), false);
  },
});

Template.listPushes.helpers({
  pushes() {
    return Exports.find();
  },
  formatDataValue(val) {
    return val.toFixed(3);
  },
  siteName(site) {
    const selectedSite = Sites.findOne({
      AQSID: site,
    });
    return selectedSite.siteName;
  },
});

Template.registerHelper('formatDates', (epoch) => {
  // convert epoch to readable format
  return moment.unix(epoch).format('YYYY/MM/DD HH:mm:ss');
});
