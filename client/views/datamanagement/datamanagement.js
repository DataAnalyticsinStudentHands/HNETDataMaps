Meteor.subscribe('editedPoints');

Template.datamanagement.helpers({
  points() {
    return EditedPoints.find();
  },
  formatDataValue(val) {
    return val.toFixed(3);
  },
  isValid() {
    var validFlagSet = _.pluck(_.where(flagsHash, {
      selectable: true,
    }), 'val');
    return _.contains(validFlagSet, selectedFlag.get());
  },
});

Template.registerHelper('formatDate', function (epoch) {
  return moment(epoch).format('YYYY/MM/DD HH:mm:ss');
});

Template.datamanagement.helpers({

});

Template.datamanagement.events({
  'change #datepicker' (event) {
    startEpoch.set(moment(event.target.value, 'YYYY-MM-DD').unix());
    endEpoch.set(moment.unix(startEpoch.get()).add(4320, 'minutes').unix());
  },
});
