 Meteor.methods({
  addFave: function (mapCenter) {
    // Make sure the user is logged in before adding a favorite to their account
    if (! Meteor.userId()) {
      throw new Meteor.Error("You need to be signed in to save favorites!");
    }

    Favorites.insert({
        lng: mapCenter.lng,
        lat: mapCenter.lat,
        createdAt: new Date(),            // current time
        owner: Meteor.userId(),           // _id of logged in user
        username: Meteor.user().username,  // username of logged in user
        email: Meteor.user().email
      });
  },
  deleteFave: function (faveId) {
    var task = Favorites.findOne(favoriteId);
    

    Favorites.remove(favoriteId);
  }
});