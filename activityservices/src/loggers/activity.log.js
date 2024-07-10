// userLogger.js
const winstonLogger = require("./winston.log.js");
const pinoLogger = require("./grafana.log.js");
const { v4: uuidv4 } = require("uuid");

class ActivityLogger {
  constructor() {
    this.winstonLogger = winstonLogger;
    this.pinoLogger = pinoLogger;
  }
  commonParams(params) {
    let context, req, metadata;
    if (!Array.isArray(params)) {
      context = params;
    } else {
      [context, req, metadata] = params;
    }
    const requestId = req?.requestId || uuidv4();
    return {
      requestId,
      context,
      metadata,
    };
  }

  log(message, params) {
    const paramLog = this.commonParams(params);
    const logObject = Object.assign(
      {
        message,
      },
      paramLog
    );
    this.winstonLogger.info(logObject);
    this.pinoLogger.info(logObject);
  }

  error(message, params) {
    const paramLog = this.commonParams(params);
    const logObject = Object.assign(
      {
        message,
      },
      paramLog
    );
    this.winstonLogger.error(logObject);
    this.pinoLogger.error(logObject);
  }
}

module.exports = new ActivityLogger();
