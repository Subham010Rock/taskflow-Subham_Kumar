const { ValidationError } = require('../utils/errors');

const projectValidator = {

  // Validate project creation
  validateCreate(data) {
    const errors = {};

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.name = 'is required';
    } else if (data.name.trim().length > 255) {
      errors.name = 'must be less than 255 characters';
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      errors.description = 'must be a string';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return {
      name: data.name.trim(),
      description: data.description ? data.description.trim() : null,
    };
  },

  // Validate project update (PATCH — all fields optional)
  validateUpdate(data) {
    const errors = {};

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim() === '') {
        errors.name = 'must be a non-empty string';
      } else if (data.name.trim().length > 255) {
        errors.name = 'must be less than 255 characters';
      }
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      errors.description = 'must be a string';
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const cleaned = {};
    if (data.name !== undefined) cleaned.name = data.name.trim();
    if (data.description !== undefined) cleaned.description = data.description.trim();

    return cleaned;
  },
};

module.exports = projectValidator;