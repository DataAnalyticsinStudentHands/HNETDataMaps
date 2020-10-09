import { logger } from 'meteor/votercircle:winston';
import { moment } from 'meteor/momentjs:moment';
import { LiveSites } from '../api/collections_server';

// resets the last push epoch for a site
export const resetLastPushDate = function resetLastPushDate(aqsid) {
  // get closest 5 min intervall
  const ROUNDING = 5 * 60 * 1000;/* ms */
  let now = moment();
  now = moment(Math.floor((+now) / ROUNDING) * ROUNDING);

  LiveSites.update({
    // Selector
    AQSID: `${aqsid}`
  }, {
    // Modifier
    $set: {
      lastPushEpoch: moment(now).unix()
    }
  }, { validate: false });
  logger.info(`Reset last push epoch called for ${aqsid} - ${LiveSites.findOne({ AQSID: aqsid }).siteName}`);
};
