const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const userRepository = require('../repositories/userRepository');
const { AppError, UnauthorizedError } = require('../utils/errors');

const authService = {

  // Register a new user
  async register(name, email, password) {
    // Step 1: Check if email is already taken
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('email already exists', 409);
    }

    // Step 2: Hash the password
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.cost);

    // Step 3: Save user to database
    const user = await userRepository.create(name, email, hashedPassword);

    // Step 4: Generate JWT token
    const token = generateToken(user);

    // Step 5: Return user data + token
    return { token, user };
  },

  // Login an existing user
  async login(email, password) {
    // Step 1: Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't say "user not found" → security risk!
      throw new UnauthorizedError('invalid credentials');
    }

    // Step 2: Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Same error message! Don't reveal which part was wrong.
      throw new UnauthorizedError('invalid credentials');
    }

    // Step 3: Generate JWT token
    const token = generateToken(user);

    // Step 4: Return user data + token
    // Remove password from user object before returning!
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  },
};

// Helper: Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    }
  );
}

module.exports = authService;