class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(fields) {
    super('validation failed', 400);
    this.type = 'validation';
    this.fields = fields;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'forbidden') {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};