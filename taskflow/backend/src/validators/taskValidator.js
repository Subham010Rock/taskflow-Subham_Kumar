const { ValidationError } = require('../utils/errors');

// Valid enum values
const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const taskValidator = {

  // Validate task creation
  validateCreate(data) {
    const errors = {};

    // Title: required
    if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
      errors.title = 'is required';
    } else if (data.title.trim().length > 255) {
      errors.title = 'must be less than 255 characters';
    }

    // Description: optional, but must be string if provided
    if (data.description !== undefined && typeof data.description !== 'string') {
      errors.description = 'must be a string';
    }

    // Priority: required (your decision!)
    if (!data.priority) {
      errors.priority = 'is required';
    } else if (!VALID_PRIORITIES.includes(data.priority)) {
      errors.priority = `must be one of: ${VALID_PRIORITIES.join(', ')}`;
    }

    // Status: optional (defaults to 'todo'), but validate if provided
    if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
      errors.status = `must be one of: ${VALID_STATUSES.join(', ')}`;
    }

    // Assignee ID: optional, but must be valid UUID if provided
    if (data.assignee_id !== undefined && data.assignee_id !== null) {
      if (!isValidUUID(data.assignee_id)) {
        errors.assignee_id = 'must be a valid UUID';
      }
    }

    // Due date: optional, but must be valid date if provided
    if (data.due_date !== undefined && data.due_date !== null) {
      if (!isValidDate(data.due_date)) {
        errors.due_date = 'must be a valid date (YYYY-MM-DD)';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      status: data.status || 'todo',
      priority: data.priority,
      assigneeId: data.assignee_id || null,
      dueDate: data.due_date || null,
    };
  },

  // Validate task update (PATCH — all fields optional)
  validateUpdate(data) {
    const errors = {};

    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.trim() === '') {
        errors.title = 'must be a non-empty string';
      } else if (data.title.trim().length > 255) {
        errors.title = 'must be less than 255 characters';
      }
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      errors.description = 'must be a string';
    }

    if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
      errors.status = `must be one of: ${VALID_STATUSES.join(', ')}`;
    }

    if (data.priority !== undefined && !VALID_PRIORITIES.includes(data.priority)) {
      errors.priority = `must be one of: ${VALID_PRIORITIES.join(', ')}`;
    }

    if (data.assignee_id !== undefined && data.assignee_id !== null) {
      if (!isValidUUID(data.assignee_id)) {
        errors.assignee_id = 'must be a valid UUID';
      }
    }

    if (data.due_date !== undefined && data.due_date !== null) {
      if (!isValidDate(data.due_date)) {
        errors.due_date = 'must be a valid date (YYYY-MM-DD)';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    // Build cleaned object with only provided fields
    const cleaned = {};
    if (data.title !== undefined) cleaned.title = data.title.trim();
    if (data.description !== undefined) cleaned.description = data.description.trim();
    if (data.status !== undefined) cleaned.status = data.status;
    if (data.priority !== undefined) cleaned.priority = data.priority;
    if (data.assignee_id !== undefined) cleaned.assignee_id = data.assignee_id;
    if (data.due_date !== undefined) cleaned.due_date = data.due_date;

    return cleaned;
  },

  // Validate query filters for listing tasks
  validateFilters(query) {
    const filters = {};

    if (query.status) {
      if (!VALID_STATUSES.includes(query.status)) {
        throw new ValidationError({
          status: `must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      filters.status = query.status;
    }

    if (query.assignee) {
      if (!isValidUUID(query.assignee)) {
        throw new ValidationError({
          assignee: 'must be a valid UUID',
        });
      }
      filters.assignee = query.assignee;
    }

    // Pagination
    if (query.page) {
      const page = parseInt(query.page, 10);
      if (isNaN(page) || page < 1) {
        throw new ValidationError({ page: 'must be a positive integer' });
      }
      filters.page = page;
    }

    if (query.limit) {
      const limit = parseInt(query.limit, 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new ValidationError({ limit: 'must be between 1 and 100' });
      }
      filters.limit = limit;
    }

    return filters;
  },
};

// Helper: Check if string is a valid UUID v4
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper: Check if string is a valid date (YYYY-MM-DD)
function isValidDate(str) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(str)) return false;
  const date = new Date(str);
  return !isNaN(date.getTime());
}

module.exports = taskValidator;