import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { Session } from 'meteor/session';
import { flagsHash } from '../../api/constants';
import { EditPoints } from '../../api/collections_client';
import { LiveSites } from '../../api/collections_both';


Template.editPoints.helpers({
  points() {
    return EditPoints.find({}, {
            // sort: {
            //   'x': -1,
            // },
    });
  },
  availableFlags() {
    return _.where(flagsHash, { selectable: true });
  },
  flagSelected() {
    return flagsHash[Session.get('selectedFlag')];
  },
  numFlagsWillChange() {
    const newFlag = Session.get('selectedFlag')
    if (newFlag === null || isNaN(newFlag)) {
      return 0;
    }
    return EditPoints.find({
      'flag.val': {
        $not: newFlag
      }
    }).count();
  },
  numPointsSelected() {
    return EditPoints.find().count();
  },
  formatDataValue(val) {
    return val.toFixed(3);
  },
  isValid() {
    let flagSelection = false;
    let noteWritten = false;
    if (Session.get('note') !== null) {
      if (Session.get('note') !== '') {
        noteWritten = true;
      }
    }
    if (Session.get('selectedFlag') !== null) {
      flagSelection = true;
    }
    return (flagSelection && noteWritten);
  },
  pushAllowed() {
    const site = LiveSites.findOne({ AQSID: Router.current().params._id });
    if (site) {
      if (site.siteGroup === 'HNET') {
        return true;
      }
    }
    return false;
  }
});

Template.editPoints.events({
  'click .dropdown-menu li a': function (event) {
    event.preventDefault();
    Session.set('selectedFlag', parseInt($(event.currentTarget).attr('data-value'), 10));
  },
  'click button#btnCancel': function (event) {
    event.preventDefault();
    Session.set('selectedFlag', null);
  },
    // Handle the button "Push" event
  'click button#btnPush': function (event) {
    event.preventDefault();
        // Push Edited points in TCEQ format
    const pushPoints = EditPoints.find({});

    const listPushPoints = [];
    pushPoints.forEach((point) => {
      listPushPoints.push(point.x / 1000);
    });

    Meteor.call('pushEdits', Router.current().params._id, listPushPoints, (error, result) => {
      if (error) {
        sAlert.error(`Error during push. ${error}`);
      }
      if (result) {
        sAlert.success(`Pushed file ${result} successful!`);
      }
    });
  },
    // Handle the note filed change event (update note)
  'input #editNote': function (event) {
        // Get value from editNote element
    const text = event.currentTarget.value;
    Session.set('note', text);
  },
    // Handle the button "Change Flag" event
  'click button#btnChange': function (event) {
    event.preventDefault();

    const updatedPoints = EditPoints.find({}).fetch();

        // add edit to the edit collection
    Meteor.call('insertEdits', updatedPoints, flagsHash[Session.get('selectedFlag')].val, Session.get('note'));

        // update the edited points with the selected flag and note on the server
    updatedPoints.forEach((point) => {
      Meteor.call('insertEditFlag', point.site, point.x, point.instrument, point.measurement, flagsHash[Session.get('selectedFlag')].val, Session.get('note'));
    });

        // Clear note field
    $('#editNote').val('');
  }
});
