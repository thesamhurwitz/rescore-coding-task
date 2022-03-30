import winston from 'winston';

const LoggerWrapper = (): winston.Logger => {
  return winston.createLogger({
    level: 'debug',
    transports: [new winston.transports.Console()],
    exitOnError: false,
  });
};

export const logger = LoggerWrapper();
