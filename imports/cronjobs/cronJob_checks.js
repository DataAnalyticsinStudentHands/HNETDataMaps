import fs from 'fs-extra';
import os from 'os';
import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/votercircle:winston';
import { moment } from 'meteor/momentjs:moment';
import { Nodemailer } from 'meteor/epaminond:nodemailer';
import { LiveSites } from '../api/collections_both';

// structure to hold current/before status information
const statusObject = {};

// helper function to send emails using nodemailer
const sendEmail = Meteor.bindEnvironment((reportType, reportString) => {
  // Find all users that have subscribed to receive status emails and update the mailList
  const listSubscribers = Meteor.users.find({ receiveSiteStatusEmail: true });

  // list of receipients
  let mailList = '';

  listSubscribers.forEach((user) => {
    if (user.receiveSiteStatusEmail) {
      mailList = `${user.emails[0].address},${mailList}`;
    }
  });

  const transporter = Nodemailer.createTransport();
  const mailOptions = {
    from: 'HNET Site Watcher <dashadmin@uh.edu>',
    to: mailList,
    subject: reportType,
    text: reportString
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.info('Can not send email. Error: ', error);
    } else {
      logger.info(`Message sent: ${reportString}`, info);
    }
  });
});

// 5 mins check for site down
Meteor.setInterval(() => {
  const watchedPath = '/hnet/incoming/current/';

  // report
  let reportString = `H-NET Site Status as of ${moment().format('YYYY/MM/DD, HH:mm:ss')} \n`;

  // get all sites
  // const allSites = LiveSites.find({ status: 'Active' });
  const allSites = LiveSites.find({ });

  allSites.forEach((site) => {
    const siteFolder = site.incoming;
    const stats = fs.statSync(watchedPath + siteFolder);

    const currentSiteMoment = moment(Date.parse(stats.mtime)); // from milliseconds into moments
    const timeDiff = moment() - currentSiteMoment;

    if (!statusObject[siteFolder]) {
      statusObject[siteFolder] = {};
    }

    // check whether site data has been received in folder
    if (timeDiff > site.statusCheckInterval * 60 * 1000) {
      statusObject[siteFolder].current = `\n${siteFolder}: has no update since ${moment(currentSiteMoment).format('YYYY/MM/DD, HH:mm:ss')}`;
    } else {
      statusObject[siteFolder].current = `\n${siteFolder}: Operational`;
    }

    // initialize before status in first run
    if (!statusObject[siteFolder].before) {
      statusObject[siteFolder].before = statusObject[siteFolder].current;
    }

    // initialize sendUpdateReport
    statusObject[siteFolder].sendUpdateReport = false;

    // Adding info for each site to the report
    reportString = `${reportString}${statusObject[siteFolder].current}\n`;

    if (statusObject[siteFolder].current !== statusObject[siteFolder].before) {
      statusObject[siteFolder].sendUpdateReport = true;
    }

    statusObject[siteFolder].before = statusObject[siteFolder].current;
  });

  Object.keys(statusObject).forEach((site) => {
    if (Object.prototype.hasOwnProperty.call(statusObject, site)) {
      if (statusObject[site].sendUpdateReport) {
        // logger.info(`would send ... ${reportString}`);
        sendEmail(`${os.hostname()} ${statusObject[site].current}`, reportString);
      }
    }
  });
}, 5 * 60 * 1000); // run every 5 min, to report a site is down immidiately
