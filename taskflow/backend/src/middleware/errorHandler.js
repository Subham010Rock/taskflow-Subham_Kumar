const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error (for debugging)
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
  });

  // If we already set a status code on the error, use it
  // Otherwise, default to 500 (server error)
  const statusCode = err.statusCode || 500;

  // If it's a validation error with field details
  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'validation failed',
      fields: err.fields,
    });
  }

  // For all other errors
  res.status(statusCode).json({
    error: statusCode === 500 ? 'internal server error' : err.message,
  });
};

module.exports = errorHandler;