// import packages
import fs from 'fs-extra';
import junk from 'junk';

// structure to hold current/before status information
const statusObject = {};

// helper function to send emails using nodemailer
const sendEmail = Meteor.bindEnvironment(function (reportType, reportString) {

  // Find all users that have subscribed to receive status emails and update the mailList
  const listSubscribers = Meteor.users.find({ receiveSiteStatusEmail: true });

  // list of receipients
  let mailList = '';

  listSubscribers.forEach(function(user) {
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
      logger.info('Message sent: ', info);
    }
  });
});

// every 10 mins push data
Meteor.setInterval(() => {
  // get sites
  const activeSites = LiveSites.find({ status: 'Active' });

  activeSites.forEach(function(site) {
    // get closest 5 min intervall
    const ROUNDING = 5 * 60 * 1000;/* ms */
    let end = moment();
    end = moment(Math.floor((+end) / ROUNDING) * ROUNDING);

    // check last push not older than 24 hours
    if (site.lastPushEpoch > moment().subtract(1, 'days').unix()) {
      const startEpoch = site.lastPushEpoch;
      const endEpoch = moment(end).unix();
      const startTime = moment.unix(startEpoch).format('YYYY-MM-DD-HH-mm-ss');
      const endTime = moment.unix(endEpoch).format('YYYY-MM-DD-HH-mm-ss');
      logger.info(`calling push from cronJobs for AQSID: ${site.AQSID} ${site.siteName}, startEpoch: ${startEpoch}, endEpoch: ${endEpoch}, startTime: ${startTime}, endEpoch: ${endTime}`);
      // call push data to TCEQ
      Meteor.call('pushData', site.AQSID, startEpoch, endEpoch, false, (err) => {
        if (!err) {
          LiveSites.update({
            _id: site._id
          }, {
            $set: {
              lastPushEpoch: endEpoch
            }
          }, { validate: false });
        }
      });
    }
  });
}, 10 * 60 * 1000); // run every 10 min, to push new data

// 5 mins check for site down
Meteor.setInterval(() => {
  const watchedPath = '/hnet/incoming/current/';

  // report
  let reportString = `H-NET Site Status as of ${moment().format('YYYY/MM/DD, HH:mm:ss')} \n`;

  // get sites
  const allSites = LiveSites.find({ });

  allSites.forEach((site) => {
    const siteName = site.incoming;
    const stats = fs.statSync(watchedPath + siteName);

    const currentSiteMoment = moment(Date.parse(stats.mtime)); // from milliseconds into moments
    const timeDiff = moment() - currentSiteMoment;

    if (!statusObject[siteName]) {
      statusObject[siteName] = {};
    }

    if (timeDiff > site.statusCheckInterval * 60 * 1000) {
      statusObject[siteName].current = `\n${siteName}: has no update since ${moment(currentSiteMoment).format('YYYY/MM/DD, HH:mm:ss')}`;
    } else {
      statusObject[siteName].current = `\n${siteName}: Operational`;
    }

    // initialize before status in first run
    if (!statusObject[siteName].before) {
      statusObject[siteName].before = statusObject[siteName].current;
    }

    // initialize sendUpdateReport
    statusObject[siteName].sendUpdateReport = false;

    // Adding info for each site to the report
    reportString = `${reportString}${statusObject[siteName].current}\n`;

    if (statusObject[siteName].current !== statusObject[siteName].before) {
      statusObject[siteName].sendUpdateReport = true;
    }

    statusObject[siteName].before = statusObject[siteName].current;

  // fs.readdir(watchedPath, function(err, folders) {
  //   folders.filter(junk.not).forEach(function(afolder) {
  //     const stats = fs.statSync(watchedPath + afolder);
	//
  //     const currentSiteMoment = moment(Date.parse(stats.mtime)); // from milliseconds into moments
  //     const timeDiff = moment() - currentSiteMoment;
	//
  //     if (!statusObject[afolder]) {
  //       statusObject[afolder] = {};
  //     }
	//
  //     if (timeDiff > 30 * 60 * 1000) {
  //       statusObject[afolder].current = `\n${afolder}: has no update since ${moment(currentSiteMoment).format('YYYY/MM/DD, HH:mm:ss')}`;
  //     } else {
  //       statusObject[afolder].current = `\n${afolder}: Operational`;
  //     }
	//
  //     // initialize before status in first run
  //     if (!statusObject[afolder].before) {
  //       statusObject[afolder].before = statusObject[afolder].current;
  //     }
	//
  //     // initialize sendUpdateReport
  //     statusObject[afolder].sendUpdateReport = false;
	//
  //     // Adding info for each site to the report
  //     reportString = `${reportString}${statusObject[afolder].current}\n`;
	//
  //     if (statusObject[afolder].current !== statusObject[afolder].before) {
  //       statusObject[afolder].sendUpdateReport = true;
  //     }
	//
  //     statusObject[afolder].before = statusObject[afolder].current;
  //   });
  });

  for(const site in statusObject) {
    if (statusObject.hasOwnProperty(site)) {
      if (statusObject[site].sendUpdateReport) {
        sendEmail(`${require('os').hostname()} ${statusObject[site].current}`, reportString);
      }
    }
  }
}, 5 * 60 * 1000); // run every 5 min, to report a site is down immidiately
