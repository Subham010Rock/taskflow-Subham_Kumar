const { ValidationError } = require('../utils/errors');

const authValidator = {

  // Validate registration input
  validateRegister(data) {
    const errors = {};

    // Name validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.name = 'is required';
    } else if (data.name.trim().length > 255) {
      errors.name = 'must be less than 255 characters';
    }

    // Email validation
    if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
      errors.email = 'is required';
    } else if (!isValidEmail(data.email)) {
      errors.email = 'must be a valid email address';
    }

    // Password validation
    if (!data.password || typeof data.password !== 'string') {
      errors.password = 'is required';
    } else if (data.password.length < 8) {
      errors.password = 'must be at least 8 characters';
    }

    // If any errors exist, throw ValidationError
    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    // Return cleaned data
    return {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };
  },

  // Validate login input
  validateLogin(data) {
    const errors = {};

    if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
      errors.email = 'is required';
    }

    if (!data.password || typeof data.password !== 'string') {
      errors.password = 'is required';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };
  },
};

// Helper function: basic email format check
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = authValidator;