const authService = require('../services/authService');
const authValidator = require('../validators/authValidator');

const authController = {

  // POST /auth/register
  async register(req, res, next) {
    try {
      // Step 1: Validate input (throws ValidationError if invalid)
      const { name, email, password } = authValidator.validateRegister(req.body);

      // Step 2: Call service to register user
      const result = await authService.register(name, email, password);

      // Step 3: Send success response
      res.status(201).json({
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      // Pass error to global error handler
      next(error);
    }
  },

  // POST /auth/login
  async login(req, res, next) {
    try {
      // Step 1: Validate input
      const { email, password } = authValidator.validateLogin(req.body);

      // Step 2: Call service to login
      const result = await authService.login(email, password);

      // Step 3: Send success response
      res.status(200).json({
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;