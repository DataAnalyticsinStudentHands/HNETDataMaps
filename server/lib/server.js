//using winston.log instead of console log
winston = Meteor.npmRequire('winston');

winston.add(winston.transports.DailyRotateFile, {
    filename: 'datamaps.log',
    dirname: '/var/log/meteor/'
});

winston.info('Winston logs are being captured console and file (/var/log/meteor/datamaps.log)');