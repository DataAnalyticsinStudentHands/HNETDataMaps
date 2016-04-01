//Roles.createRole( 'admin' ); 

Roles.addUsersToRoles('a3GqmrbvMkaXqRkvC', 'admin', 'default-group');


Accounts.config({
    sendVerificationEmail: true
    //forbidClientAccountCreation: false //interfered with yogiben:admin
});

AdminConfig = {
  collections: {
	  Monitors: {},
	  AggrData: {}
  }
};

Accounts.validateNewUser(function (user) {
  var loggedInUser = Meteor.user();

  if (Roles.userIsInRole(loggedInUser, ['admin','manage-users'])) {
    // NOTE: This example assumes the user is not using groups.
    return true;
  }

  throw new Meteor.Error(403, "You are not authorized to create new users.");
});