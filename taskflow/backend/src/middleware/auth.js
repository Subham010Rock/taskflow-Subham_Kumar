const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { UnauthorizedError } = require('../utils/errors');

const authMiddleware = (req, res, next) => {
  try {
    // Step 1: Get the Authorization header
    const authHeader = req.headers.authorization;
    
    // Step 2: Check if header exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('no token provided');
    }

    // Step 3: Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // Step 4: Verify the token
    const payload = jwt.verify(token, config.jwt.secret);

    // Step 5: Attach user info to the request object
    req.user = {
      id: payload.user_id,
      email: payload.email,
    };

    // Step 6: Continue to next middleware/route
    next();
  } catch (error) {
    // jwt.verify throws specific errors:
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('invalid token'));
    } else {
      next(error);
    }
  }
};

module.exports = authMiddleware;