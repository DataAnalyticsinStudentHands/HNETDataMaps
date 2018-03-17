import { logger } from 'meteor/votercircle:winston';

import './listPushes.html';

const dataToShow = new ReactiveVar();
const dataFilePath = new ReactiveVar();
Session.set('ToggleSelector', true);

Template.listPushes.helpers({
  selector() {
    return { manual: Session.get('ToggleSelector') };
  },
  toggle_selector_options() { }
});

Template.viewDataCell.events({
  'click .js-view-data': function(event) {
    const dataTable = $(event.target).closest('table').DataTable();
    const rowIndex = $(event.target).closest('tr').index();
    const rowData = dataTable.row(rowIndex).data();


    Meteor.call('loadFile', rowData.fileName, (err, res) => {
      if (err) {
        sAlert.error('Could not find file.');
      }

      dataToShow.set(res);
      dataFilePath.set(rowData.fileName);
      // Show the Data File modal
      $('#dataFileModal').modal({}).modal('show');
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
