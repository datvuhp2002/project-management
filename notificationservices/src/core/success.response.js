"use strict";
const httpStatusCode = require("../utils/httpStatusCode");

class SuccessResponse {
  constructor({
    message,
    statusCode = httpStatusCode.StatusCodes.OK,
    reasonStatusCode = httpStatusCode.ReasonPhrases.OK,
    data = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.data = data;
  }

  send(res, header = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, data }) {
    super({ message, data });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = httpStatusCode.StatusCodes.CREATED,
    reasonStatusCode = httpStatusCode.ReasonPhrases.CREATED,
    data,
  }) {
    super({ message, statusCode, reasonStatusCode, data });
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
