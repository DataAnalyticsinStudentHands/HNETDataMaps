Meteor.subscribe('editedPoints');

Template.listEdits.helpers({
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
