import winston from 'winston';

// Setting up Winston logger
const console = new winston.transports.Console({ name: 'console', timestamp: true });
export const logger = new winston.Logger({ transports: [console] });
