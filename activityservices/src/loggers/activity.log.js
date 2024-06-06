const { createLogger, format, transports } = require("winston");
const { v4: uuidv4 } = require("uuid");
const { ecsFormat } = require("@elastic/ecs-winston-format");
require("winston-daily-rotate-file");
class ActivityLogger {
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
        ecsFormat(),
        format.timestamp({ format: "YYYY-MM-DD hh:mm:SSS A" }),
        formatPrint
      ),
      transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
          dirname: "src/logs",
          filename: "activity-%DATE%.info.log",
          datePattern: "YYYY-MM-DD-HH-mm",
          zippedArchive: true,
          maxSize: "1m",
          maxFiles: "14d",
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD hh:mm:SSS A" }),
            ecsFormat()
          ),
          level: "info",
        }),
        new transports.DailyRotateFile({
          dirname: "src/logs",
          filename: "activity-%DATE%.error.log",
          datePattern: "YYYY-MM-DD-HH-mm",
          zippedArchive: true,
          maxSize: "1m",
          maxFiles: "14d",
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD hh:mm:SSS A" }),
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

module.exports = new ActivityLogger();
