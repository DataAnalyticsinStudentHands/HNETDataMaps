import { Template } from 'meteor/templating';

import './listManualPushes.html';

Template.listManualPushes.helpers({
  selector() {
    return { manual: true };
  }
});
