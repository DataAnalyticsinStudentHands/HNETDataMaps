import winston from 'winston';

// Setting up Winston logger
export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({ name: 'console', timestamp: true }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

//const console = new winston.transports.Console({ name: 'console', timestamp: true });
//export const logger = new winston.Logger({ transports: [console] });
