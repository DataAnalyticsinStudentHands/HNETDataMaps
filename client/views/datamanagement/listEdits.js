Template.viewEditsCell.events({
  'click .js-view-edits': function () {
    Router.go(`/site/${this.site}`);
  }
});
