"use strict";
const httpStatusCode = require("../utils/httpStatusCode");

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(
    message = httpStatusCode.ReasonPhrases.CONFLICT,
    statusCode = httpStatusCode.StatusCodes.CONFLICT
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = httpStatusCode.ReasonPhrases.BAD_REQUEST,
    statusCode = httpStatusCode.StatusCodes.BAD_REQUEST
  ) {
    super(message, statusCode);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(
    message = httpStatusCode.ReasonPhrases.UNAUTHORIZED,
    statusCode = httpStatusCode.StatusCodes.UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message = httpStatusCode.ReasonPhrases.NOT_FOUND,
    statusCode = httpStatusCode.StatusCodes.NOT_FOUND
  ) {
    super(message, statusCode);
  }
}
class ForbiddenError extends ErrorResponse {
  constructor(
    message = httpStatusCode.ReasonPhrases.FORBIDDEN,
    statusCode = httpStatusCode.StatusCodes.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}
module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
};
