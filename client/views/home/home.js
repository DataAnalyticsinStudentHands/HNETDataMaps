Template.home.onRendered(function() {

  const latude = 29.721; // Houston
  const lngtude = -95.3443;

  var AQmap = L.map('displayMap', {doubleClickZoom: false});

  Meteor.subscribe('liveSites', [lngtude, latude]);

	LiveSites.find().observeChanges({
    added: function(id, line) {
      var marker = L.marker([
        line.loc.coordinates[1], line.loc.coordinates[0]
      ], {title: line.siteName}).addTo(AQmap).on('click', onClick);

      var content = `${line.status}`;
      marker.bindPopup(content);
    } // end of added
  });

  $('#displayMap').css('height', window.innerHeight - 20);
  $('#displayMap').css('width', window.innerWidth / 2 - 20);
  L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';

  AQmap.setView([
    latude, lngtude
  ], 9);

  L.tileLayer.provider('OpenStreetMap.DE').addTo(AQmap);
});

Template.pushStatusCell.helpers({
  pushTimeStamp() {
    return moment.unix(this.item.lastPushEpoch).format('YYYY/MM/DD HH:mm');
  },
  isActualPush() {
    const checkEpoch = moment().subtract(1, 'days').unix();
    if (this.item.lastPushEpoch > checkEpoch) {
      return true;
    }
    return false;
  }
});

function onClick(e) {
  Router.go(`/site/${this.AQSID}`);
}
