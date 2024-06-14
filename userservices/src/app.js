require("dotenv").config();
const express = require("express");
const compression = require("compression");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const { continuousConsumer } = require("./message_queue/consumer");
const {
  runAssignmentConsumerOnDemand,
} = require("./message_queue/consumer.assignment.demand");
const { v4: uuidv4 } = require("uuid");
const UserLogger = require("./loggers/user.log");
const initElasticsearch = require("./dbs/init.elasticsearch");

const app = express();

// init middlewarenpm
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// init elasticsearch
// initElasticsearch.init({
//   ELASTICSEARCH_IS_ENABLED: true,
// });
// init db
require(`./dbs/init.dbs`);
// init routes
app.use("", require("./routes"));
// // init logger
app.use((req, res, next) => {
  const requestId = req.headers.user;
  req.requestId = requestId ? requestId : uuidv4();
  UserLogger.log(`input params:-:${req.method}:-:`, [
    req.path,
    { requestId: req.requestId },
    req.method === "POST" ? req.body : req.query,
  ]);
  next();
});
// handle errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const resMessage = `${err.status}:-:${
    Date.now() - err.now
  }ms:-:Response:${JSON.stringify(err)}`;
  UserLogger.error(resMessage, [
    req.path,
    {
      requestId: req.requestId,
    },
    {
      message: err.message,
    },
  ]);
  return res.status(status).json({
    status: "Error",
    code: status,
    stack: err.stack,
    message: err.message || "Internal Server Error",
  });
});
continuousConsumer().catch(console.error);
(async () => {
  try {
    console.log("Starting consumer...");
    await runAssignmentConsumerOnDemand();
    console.log("Consumer started successfully.");
  } catch (error) {
    console.error("Error starting consumer:", error);
    process.exit(1); // Thoát ứng dụng với mã lỗi nếu không thể khởi động consumer
  }
})();
module.exports = app;
