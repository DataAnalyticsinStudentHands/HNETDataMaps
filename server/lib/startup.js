import fs from 'fs-extra';

// using winston.log instead of console log
logger = Winston;

logger.info(`Winston logs are being captured on the console for host: ${require('os').hostname()}.`);

Meteor.startup(function() {
  // Insert sample data if the live site collection is empty
  if (LiveSites.find().count() === 0) {
    JSON.parse(Assets.getText('livesites.json')).site.forEach(function(doc) {
      LiveSites.insert(doc);
    });
  }

  // Create directory for outgoing files for tomorrow
  fs.mkdirs(`/hnet/outgoing/${moment().year()}/${moment().month() + 1}/${moment().date() + 1}`, function (err) {
    if (err) {
      logger.error(err);
    }
  });
});
