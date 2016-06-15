Meteor.subscribe('exports');
Meteor.subscribe('sites');

const dataToShow = new ReactiveVar();

Template.listPushes.events({
  'click .active'(event, instance) {
    // Get data in TCEQ format
    DataExporter.getDataTCEQ(instance.$('i').data('site'), instance.$('i').data('start'), instance.$('i').data('end'), false, false).then(function (response) {
      dataToShow.set(response);
      // Show the Data File modal
      $('#dataFileModal').modal({}).modal('show');
    }, function (error) {
      sAlert.error(`did not find any data for site: ${instance.$('i').data('site')},
			startEpoch: ${instance.$('i').data('start')},
			endEpoch: ${instance.$('i').data('end')}, ${error}`);
    });
  }
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
      AQSID: site
    });
    return selectedSite.siteName;
  }
});

Template.dataFile.helpers({
  dataFromFile() {
    return Papa.unparse(dataToShow.get());
  }
});

Template.registerHelper('formatDates', (epoch) => {
  // convert epoch to readable format
  return moment.unix(epoch).format('YYYY/MM/DD HH:mm:ss');
});
