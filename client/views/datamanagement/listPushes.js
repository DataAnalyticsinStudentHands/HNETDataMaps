const dataToShow = new ReactiveVar();
const dataFilePath = new ReactiveVar();

Template.listPushes.helpers({
  selector() {
    return {manual: true}; // this could be pulled from a Session var or something that is reactive
  }
});

Template.viewDataCell.events({
  'click .js-view-data': function(event) {
    const dataTable = $(event.target).closest('table').DataTable();
    const rowIndex = $(event.target).closest('tr').index();
    const rowData = dataTable.row(rowIndex).data();

    Meteor.call('loadFile', rowData.fileName, function(err, response) {
      if (!err) {
        dataToShow.set(response);
        dataFilePath.set(rowData.fileName);
        // Show the Data File modal
        $('#dataFileModal').modal({}).modal('show');
      } else {
        sAlert.error('Could not find file.');
      }
    });
  }
});

Template.dataFile.helpers({
  dataFromFile() {
    return dataToShow.get();
  },
  dataFileName() {
    return dataFilePath.get();
  }
});

Template.viewDataCell.helpers({
  pushed() {
    if (this.item.fileName !== undefined) {
      if (this.item.fileName !== '') {
        return 'green';
      }
    }
    return 'red';
  },
  isPushed() {
    if (this.item.fileName !== undefined) {
      if (this.item.fileName !== '') {
        return true;
      }
    }
    return false;
  }
});
