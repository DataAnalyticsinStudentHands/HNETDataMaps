// using winston.log instead of console log
logger = Winston;

logger.info(`Winston logs are being captured on the console for host: ${require('os').hostname()}.`);

Meteor.startup(function () {
  // Insert sample data if the site collection is empty
  if (Sites.find().count() === 0) {
    JSON.parse(Assets.getText("sites.json")).site.forEach(function (doc) {
      Sites.insert(doc);
    });
  }
});
