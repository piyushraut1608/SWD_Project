const winston = require('winston');
// const {format}=require('winston')

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.simple(),
//   format: format.combine(
//     format.timestamp(),
//     format.simple()
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'error.log', level: 'error' }),
//     new winston.transports.File({ filename: 'combined.log' }),
//   ],
// });

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