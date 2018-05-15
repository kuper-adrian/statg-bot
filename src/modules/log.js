const logger = require('winston');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.add(logger.transports.File, {
    filename: '../logs/combined.log',
    maxsize: '2000000', 
    maxFiles: '2', 
    timestamp: true
});
logger.level = 'debug';

exports.getLogger = function () {
    return logger;
}