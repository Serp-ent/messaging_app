class AppError extends Error {
  constructor(statusCode, message) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(500, message);
  }
}

class NotImplementedError extends AppError {
  constructor(message = 'Not Implemented') {
    super(501, message);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  NotImplementedError
};