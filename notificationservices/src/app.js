require("dotenv").config();
const express = require("express");
const compression = require("compression");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const NotificationLogger = require("./loggers/notification.log");
const { v4: uuidv4 } = require("uuid");

const { continuousConsumer } = require("./message_queue/consumer");
const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// init db
require(`./dbs/init.dbs`);
//init middleware logger
app.use((req, res, next) => {
  const requestId = req.headers.user;
  req.requestId = requestId ? requestId : uuidv4();
  NotificationLogger.log(`input params:-:${req.method}:-:`, [
    req.path,
    { requestId: req.requestId },
    req.method === "POST" ? req.body : req.query,
  ]);
  next();
});
// init routes
app.use("", require("./routes"));
// handle errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const resMessage = `${err.status}:-:${
    Date.now() - err.now
  }ms:-:Response:${JSON.stringify(err)}`;
  NotificationLogger.error(resMessage, [
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
    message: err.message || "Internal Server Error",
  });
});
continuousConsumer().catch(console.error());

module.exports = app;
