Meteor.subscribe('liveSites');

Template.about.onRendered(function() {
    $.getScript("https:////cdnjs.cloudflare.com/ajax/libs/jquery.matchHeight/0.7.0/jquery.matchHeight-min.js", function() {
      $(function() {
        $('.equal-height-panels .panel').matchHeight();
      });
    });
  });

Template.about.helpers({
  sitename() {
    const site = LiveSites.findOne({ AQSID: Router.current().params._id });
    return site && site.siteName;
  }
});
