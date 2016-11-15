// import packages
import fs from 'fs-extra';
import junk from 'junk';

let lastReportTime = 0;
// structure to hold current/before status information
const statusObject = {};

// const sendEmail = Meteor.bindEnvironment(function (reportType, reportString) {
//
// 	// Find all users that have subscribed to receive status emails and update the mailList
//   const listSubscribers = Meteor.users.find({receiveSiteStatusEmail: true});
//
// 	// list of receipients
// 	let mailList = '';
//
//   listSubscribers.forEach(function(user) {
//     if (user.receiveSiteStatusEmail) {
//       mailList = `${user.emails[0].address},${mailList}`;
//     }
//   });
//
//   const transporter = Nodemailer.createTransport();
//   let mailOptions = {
//     from: 'HNET Site Watcher <dashadmin@uh.edu>',
//     to: mailList,
//     subject: reportType,
//     text: reportString
//   };
//
//   transporter.sendMail(mailOptions, function(error, info) {
//     if (error) {
//       logger.info('Can not send email. Error: ', error);
//     } else {
//       logger.info('Message sent: ', info);
//     }
//   });
// });

// every 10 mins push data
// Meteor.setInterval(() => {
//   // get sites
//   const activeSites = LiveSites.find({ status: 'Active' });
//
//   activeSites.forEach(function(site) {
//     // get closest 5 min intervall
//     const ROUNDING = 5 * 60 * 1000;/* ms */
//     let end = moment();
//     end = moment(Math.floor((+ end) / ROUNDING) * ROUNDING);
//
//     // check last push not older than 24 hours
//     if (site.lastPushEpoch > moment().subtract(1, 'days').unix()) {
//       const startEpoch = site.lastPushEpoch;
//       const endEpoch = moment(end).unix();
//       const startTime = moment.unix(startEpoch).format('YYYY-MM-DD-hh-mm-ss');
//       const endTime = moment.unix(endEpoch).format('YYYY-MM-DD-hh-mm-ss');
//       console.log(`called export from cron for AQSID: ${site.AQSID}, startEpoch: ${startEpoch}, endEpoch: ${endEpoch}, startTime: ${startTime}, endEpoch: ${endTime}`);
//       // create TCEQ export formated data and push
//       Meteor.call('exportData', site.AQSID, startEpoch, endEpoch, (err, data) => {
//         // create csv file to be pushed in temp folder
//         const outputFile = `/hnet/test/${moment.utc().format('YYMMDDHHmmss')}.uh`;
//         const csvComplete = Papa.unparse(data);
//         // removing header from csv string
//         const n = csvComplete.indexOf('\n');
//         const csv = csvComplete.substring(n + 1);
//
//         fs.writeFile(outputFile, csv, function(err) {
//           if (err) {
//             logger.error(`Could not write TCEQ push file. Error: ${err}`);
//             throw new Meteor.Error(`Could not write TCEQ push file. Error: ${err}`);
//           }
//         });
//         if (!err) {
//           LiveSites.update({
//             _id: site._id
//           }, {
//             $set: {
//               lastPushEpoch: endEpoch
//             }
//           }, { validate: false });
//         }
//       });
//     }
//   });
// }, 10 * 60 * 1000); // run every 10 min, to push new data

// daily reset of values for reports
Meteor.setInterval(() => {
  // reset to trigger daily report
  lastReportTime = 0;

  // Create directory for outgoing files for tomorrow
  fs.mkdirs(`/hnet/outgoing/${moment().year()}/${moment().month() + 1}/${moment().date() + 1}`, function(err) {
    if (err) {
      logger.error(err);
    }

    console.log("successel create for tomorrow!")
  });

}, 24 * 3600 * 1000);

// 5 mins check for site down
Meteor.setInterval(() => {
  const watchedPath = '/hnet/incoming/current/';

  // report
  let reportString = `H-NET Site Status as of ${moment().format('YYYY/MM/DD, HH:mm:ss')} \n`;

  fs.readdir(watchedPath, function(err, folders) {
    folders.filter(junk.not).forEach(function(afolder) {
      const stats = fs.statSync(watchedPath + afolder);

      const currentSiteMoment = moment(Date.parse(stats.mtime)); // from milliseconds into moments
      const timeDiff = moment() - currentSiteMoment;

      if (!statusObject[afolder]) {
        statusObject[afolder] = {};
      }

      if (timeDiff > 15 * 60 * 1000) {
        statusObject[afolder].current = `\n${afolder}: has no update since ${moment(currentSiteMoment).format('YYYY/MM/DD, HH:mm:ss')}`;
      } else {
        statusObject[afolder].current = `\n${afolder}: Operational`;
      }

      // initialize before status in first run
      if (!statusObject[afolder].before) {
        statusObject[afolder].before = statusObject[afolder].current;
      }

      // initialize sendUpdateReport
      statusObject[afolder].sendUpdateReport = false;

      // Adding info for each site to the report
      reportString = `${reportString}${statusObject[afolder].current}\n`;

      if (statusObject[afolder].current !== statusObject[afolder].before) {
        statusObject[afolder].sendUpdateReport = true;
      }

      statusObject[afolder].before = statusObject[afolder].current;
    });

    for (const site in statusObject) {
      if (statusObject.hasOwnProperty(site)) {
        if (statusObject[site].sendUpdateReport) {
          //sendEmail(`${site} ${statusObject[site].current}`, reportString);
					logger.info(`Email Report for ${require('os').hostname()}: ${reportString}`);
        }
      }
    }

    if (lastReportTime === 0) {
      // Daily report
      // sendEmail('Daily Report', reportString);
      logger.info(`Daily Report for ${require('os').hostname()}: ${reportString}`);
      lastReportTime = moment.unix();
    }
  });
}, 5 * 60 * 1000); // run every 5 min, to report a site is down immidiately
