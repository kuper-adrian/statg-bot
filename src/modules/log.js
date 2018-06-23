const winston = require('winston');
const fs = require('fs');

// make sure that logs folder exists
const logFolderPath = './logs';
if (!fs.existsSync(logFolderPath)) {
  fs.mkdirSync(logFolderPath);
}

const logMessagePrintFormat = (info) => {
  const {
    timestamp, level, message, ...args
  } = info;
  const ts = timestamp.slice(0, 19).replace('T', ' ');
  return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
};

const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(logMessagePrintFormat),
      ),
    }),
    new winston.transports.File({
      filename: './logs/combined.log',
      maxsize: '2000000',
      maxFiles: '5',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(logMessagePrintFormat),
      ),
    }),
  ],
});

exports.getLogger = () => logger;
