// import packages
import fs from 'fs';
import junk from 'junk';

let lastReportTime = 0;

function sendEmail(reportType, reportString) {
  const transporter = Nodemailer.createTransport();
  const mailOptions = {
    from: 'Hnet Watcher <admin@hnet>',
    to: 'plindner@uh.edu',
    subject: reportType,
    text: reportString,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.info('Can not send email. Error: ', error);
    } else {
      logger.info('Message sent: ', info);
    }
  });
}

Meteor.setInterval(() => {
  lastReportTime = 0;
}, 24 * 3600 * 1000); // daily reset

Meteor.setInterval(() => {
  const watchedPath = '/hnet/incoming/current/';

  // structure to hold current/before status information
  const statusObject = {};
  // report
  let reportString = `H-NET Site Status as of ${moment().format('YYYY/MM/DD, HH:mm:ss')} \n`;

  fs.readdir(watchedPath, function (err, folders) {
    folders.filter(junk.not).forEach(function (afolder) {
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
        if (site.sendUpdateReport) {
          sendEmail(`${site} ${site.current}`, reportString);
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
}, 1 * 60 * 1000); // run every 5 min, to report a site is down immidiately
