const { createLogger, format, transports } = require("winston");
const { v4: uuidv4 } = require("uuid");
const { ecsFormat } = require("@elastic/ecs-winston-format");
const pinoLogger = require("./grafana.log.js");
const winstonLogger = require("./winston.log.js");
require("winston-daily-rotate-file");

class GatewayLogger {
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

module.exports = new GatewayLogger();
