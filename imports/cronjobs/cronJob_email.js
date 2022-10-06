import { Meteor } from 'meteor/meteor';
import { AggrData, LiveSites } from '../api/collections_server';
import { moment } from 'meteor/momentjs:moment';
import { Nodemailer } from 'meteor/epaminond:nodemailer';

// timestamp for when last email was sent - we need to reset for the last 3 hours when instance starts up
let lastEmailSent = moment().subtract(3, 'hours');

// helper function to send emails using nodemailer
const sendEmail = Meteor.bindEnvironment((emailSubject, reportString) => {
  // Find all users that have subscribed to receive threshold emails and update the mailList
  const listSubscribers = Meteor.users.find({ receiveSiteAAEThresholdEmail: true });

  // list of receipients
  let mailList = '';

  listSubscribers.forEach((user) => {
    if (user.receiveSiteStatusEmail) {
      mailList = `${user.emails[0].address},${mailList}`;
    }
  });

  const transporter = Nodemailer.createTransport();
  const mailOptions = {
    from: 'BC2 Treshold Watcher <dashadmin@uh.edu>',
    to: mailList,
    subject: emailSubject,
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

// check for threshold
Meteor.setInterval(() => {
  // get site reading aqsid from environment (*.json pm2 config file)
  const site = LiveSites.findOne({ AQSID: process.env.aqsid });

  //helper function
  const getValue = (part, o) => Object.entries(o).find(([k, v]) => k.startsWith(part))?.[1]

  //subject
  let emailSubject = `${site.siteName} BC2 site Alert`
  // report
  let reportString = `Dear (BC)2 Team Members,\n\nALERT: The ${site.siteName} BC2 Site has has exceeded its preliminary threshold (i.e. running 1-hour average AAE). \nWe may be experiencing a biomass burning or dust event at ${site.siteName}.\n\nSincerely,\n(BC)2 Leadership`;

  //only run threshold check if treshold value has been set
  if (site.status === 'Active' && site.AAEThreshold !== void 0) {
    //get last hour
    let endEpoch = moment().unix();
    let startEpoch = moment().subtract(60, 'minutes').unix();
    //build filter to retrieve last hour of 5 minute data points
    const aggPipe = [
      {
        $match: {
          $and: [
            { site: `${site.AQSID}` },
            {
              epoch: {
                $gt: parseInt(startEpoch, 10),
                $lt: parseInt(endEpoch, 10),
              },
            },
          ],
        },
      },
      {
        $sort: {
          epoch: -1,
        },
      },
    ];

    // retrieve data
    const results = Promise.await(
      AggrData.rawCollection()
        .aggregate(aggPipe, { allowDiskUse: true })
        .toArray()
    );

    //calculate average for last hour
    if (results.length > 0) {
      let sum = 0;
      results.forEach((line) => {
        const tap = getValue('tap', line.subTypes)
        // let's use only valid AAE data points
        if (_.last(tap.AAE).val === 1) {
          sum += _.first(tap.AAE).val;
        }
      })
      const hourlyAverage = sum/results.length;
      
      //check against threshold
      if (hourlyAverage >= site.AAEThreshold) {
        //check when email was sent the last time
        var duration = moment.duration(moment().diff(lastEmailSent))
        if (duration > 3) {
          logger.info("AAA threshold exceeded. Will send email. Average calculated was ", hourlyAverage);
          sendEmail(emailSubject, reportString);
          lastEmailSent = moment();
        }
      } else {
        //check when email was sent the last time
        var duration = moment.duration(moment().diff(lastEmailSent))
        if (duration > 3) {
          console.log(duration.asHours())
          logger.info("Checking only duruation. Will send email. Average calculated was ", hourlyAverage);
          //sendEmail(emailSubject, reportString);
          lastEmailSent = moment();
        }
      }
    }
  }
}, 1 * 60 * 1000); // run every 1 min - change to ?? minutes
