Template.viewEditsCell.events({
  'click .js-view-edits': function (event) {
		const dataTable = $(event.target).closest('table').DataTable();
    const rowIndex = $(event.target).closest('tr').index();
    const rowData = dataTable.row(rowIndex).data();

		// go back to site with startEpoch
		Router.go('site', {_id: `${this.site}`}, { query: `startEpoch=${rowData.startEpoch}` });
  },
});

	Template.listEdits.events({

		'click tr': function (event) {
	    var dataTable = $(event.target).closest('table').DataTable();
	    var rowData = dataTable.row(event.currentTarget).data();
	    if (!rowData) return; // Won't be data if a placeholder row is clicked
	    // Your click handler logic here
	  }

});
