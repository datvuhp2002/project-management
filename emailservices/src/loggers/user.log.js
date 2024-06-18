const { createLogger, format, transports } = require("winston");
const { v4: uuidv4 } = require("uuid");
require("winston-daily-rotate-file");
const { ecsFormat } = require("@elastic/ecs-winston-format");

class UserLogger {
  constructor() {
    const formatPrint = format.printf(
      ({ level, message, context, requestId, timestamp, metadata }) => {
        return `${timestamp}:-:${level}:-:${context}:-:${requestId}:-:${message}:-:${JSON.stringify(
          metadata
        )}`;
      }
    );
    this.logger = createLogger({
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD hh:mm:SSS A" }),
        formatPrint,
        ecsFormat()
      ),
      transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
          dirname: "src/logs",
          filename: "userServices-%DATE%.info.log",
          datePattern: "YYYY-MM-DD-HH-mm",
          zippedArchive: true,
          maxSize: "1m",
          maxFiles: "14d",
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD hh:mm:SSS A" }),
            formatPrint,
            ecsFormat()
          ),
          level: "info",
        }),
        new transports.DailyRotateFile({
          dirname: "src/logs",
          filename: "userServices-%DATE%.error.log",
          datePattern: "YYYY-MM-DD-HH-mm",
          zippedArchive: true,
          maxSize: "1m",
          maxFiles: "14d",
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD hh:mm:SSS A" }),
            formatPrint,
            ecsFormat()
          ),
          level: "error",
        }),
      ],
    });
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
    this.logger.info(logObject);
  }
  error(message, params) {
    const paramLog = this.commonParams(params);
    const logObject = Object.assign(
      {
        message,
      },
      paramLog
    );
    this.logger.error(logObject);
  }
}

module.exports = new UserLogger();
