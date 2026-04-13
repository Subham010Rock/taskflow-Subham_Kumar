// backend/src/utils/logger.js

const winston = require('winston');

const logger = winston.createLogger({
  // Log level: info means show info, warn, and error
  // (hide debug messages in production)
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  // Format: JSON (structured logging)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  
  // Where to send logs
  transports: [
    // Send all logs to the console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

module.exports = logger;