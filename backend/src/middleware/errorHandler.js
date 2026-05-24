const logger = require('../config/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, _next) => {
  logger.error(`${err.message}`, { stack: err.stack, path: req.path });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.isOperational ? err.message : 'Internal server error',
  });
};

module.exports = errorHandler;
module.exports.AppError = AppError;
