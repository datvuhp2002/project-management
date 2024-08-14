const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");
const { ecsFormat } = require("@elastic/ecs-winston-format");

const winstonLogger = createLogger({
  format: ecsFormat(),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      dirname: "src/logs",
      filename: "gateway-%DATE%.info.log",
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
      filename: "gateway-%DATE%.error.log",
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

module.exports = winstonLogger;
