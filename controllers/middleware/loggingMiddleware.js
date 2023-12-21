const winston = require('winston');
const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
  format: format.combine(
    format.timestamp(),
    format.simple()
  ),
});

module.exports = {logger};