const pino = require("pino");
const pinoLoki = require("pino-loki");
const transport = pino.transport({
  target: "pino-loki",
  options: {
    batching: true,
    interval: 5,
    host: process.env.LOKI_HOST,
    labels: {
      job: "gatewayservices",
    },
  },
});
const logger = pino(transport);
module.exports = logger;
