Template.viewEditsCell.events({
  'click .js-view-edits': function (event) {
		var dataTable = $(event.target).closest('table').DataTable();
		var rowData = dataTable.row(event.currentTarget).data();
    // Your click handler logic here
    Router.go(`/site/${this.site}`);
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
