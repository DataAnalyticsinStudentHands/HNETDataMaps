// import packages
import fs from 'fs';
import junk from 'junk';

let lastEmergencyReportTime = 0;

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
      lastEmergencyReportTime = moment.unix();
      logger.info('Message sent: ', info);
    }
  });
}

Meteor.setInterval(() => {
  lastEmergencyReportTime = 0;
}, 24 * 3600 * 1000); // daily reset

Meteor.setInterval(() => {
  const watchedPath = '/hnet/incoming/current/';

  let timeDiff;
  const statusObject = {};

  fs.readdir(watchedPath, function (err, folders) {
    folders.filter(junk.not).forEach(function (afolder) {
      const stats = fs.statSync(watchedPath + afolder);

      statusObject[afolder] = `\n${afolder}: Operational`;

      const currentSiteMoment = moment(Date.parse(stats.mtime)); // from milliseconds into moments
      timeDiff = moment() - currentSiteMoment;

      if (timeDiff > 15 * 60 * 1000) {
        statusObject[afolder] = `\n${afolder}: has no update since ${moment(currentSiteMoment).format('YYYY/MM/DD, HH:mm:ss')}`;
      }
    });

    let sendEmergencyReport = false;
    let reportString = `H-NET Site Status as of ${moment().format('YYYY/MM/DD, HH:mm:ss')} \n`;
    logger.info(`${JSON.stringify(statusObject)}`);
    for (const property in statusObject) {
      if (statusObject.hasOwnProperty(property)) {
        if (property !== 'Operational') {
          sendEmergencyReport = true;
          reportString = `${reportString}${statusObject[property]}\n`;
        } else {
          reportString = `${reportString}`;
        }
      }
    }

    if (sendEmergencyReport && lastEmergencyReportTime === 0) {
      sendEmail('Emergency Report', reportString);
    } else {
      logger.info(`${reportString}`);
    }
  });
}, 5 * 60 * 1000); // run every 5 min, to report a site is down immidiately
