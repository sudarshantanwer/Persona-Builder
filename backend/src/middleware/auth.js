const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('./errorHandler');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AppError('Authentication required', 401));

  try {
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    next(new AppError('Invalid token', 401));
  }
};

module.exports = authenticate;
