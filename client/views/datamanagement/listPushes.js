const dataToShow = new ReactiveVar();

Template.viewDataCell.events({
  'click .js-view-data': function (event) {
		const dataTable = $(event.target).closest('table').DataTable();
		const rowIndex = $(event.target).closest('tr').index();
		const rowData = dataTable.row(rowIndex).data();

		Meteor.call('loadFile',
			function (err, response) {
				if (err) {
					sAlert.error(`Error:\n ${err.reason}`);
					return;
				}
				sAlert.success(response);
				console.log(response);
				dataToShow.set(response);
	      // Show the Data File modal
	      $('#dataFileModal').modal({}).modal('show');
			});

		// Get data in TCEQ format
    // DataExporter.getDataTCEQ(rowData.site, rowData.startEpoch, rowData.endEpoch, false, false).then(function (response) {
    //   dataToShow.set(response);
    //   // Show the Data File modal
    //   $('#dataFileModal').modal({}).modal('show');
    // }, function (error) {
    //   sAlert.error(`did not find any data for site: ${rowData.site},
		// 	startEpoch: ${rowData.startEpoch},
		// 	endEpoch: ${rowData.endEpoch}, ${error}`);
    // });
  },
});

Template.dataFile.helpers({
  dataFromFile() {
    return Papa.unparse(dataToShow.get());
  }
});
