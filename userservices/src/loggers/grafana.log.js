// pinoLogger.js
const pino = require("pino");

const transport = pino.transport({
  target: "pino-loki",
  options: {
    batching: true,
    interval: 5,
    host: process.env.LOKI_HOST,
    JSON: true,
    labels: {
      job: "userservices",
    },
  },
});

const logger = pino(transport);
module.exports = logger;
