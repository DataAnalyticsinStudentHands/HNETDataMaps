// every 10 mins push data
Meteor.setInterval(() => {
  Meteor.call('pushData',
  // reading aqsid password from environment (*.json pm2 config file)
  process.env.aqsid, false);
}, 10 * 60 * 1000); // run every 10 min, to push new data
