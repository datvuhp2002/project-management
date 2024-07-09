const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");
const { ecsFormat } = require("@elastic/ecs-winston-format");

const winstonLogger = createLogger({
  format: ecsFormat(),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      dirname: "src/logs",
      filename: "activityServices-%DATE%.info.log",
      datePattern: "YYYY-MM-DD-HH-mm",
      zippedArchive: true,
      maxSize: "1m",
      maxFiles: "14d",
      format: ecsFormat(),
      level: "info",
    }),
    new transports.DailyRotateFile({
      dirname: "src/logs",
      filename: "activityServices-%DATE%.error.log",
      datePattern: "YYYY-MM-DD-HH-mm",
      zippedArchive: true,
      maxSize: "1m",
      maxFiles: "14d",
      format: ecsFormat(),
      level: "error",
    }),
  ],
});

module.exports = winstonLogger;
