require("dotenv").config();
const express = require("express");
const compression = require("compression");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const { continuousConsumer } = require("./message_queue/consumer");
const {
  runConsumerTaskOnDemand,
} = require("./message_queue/consumer.task.demand");
const {
  runConsumerUserOnDemand,
} = require("./message_queue/consumer.user.demand");
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
// init routes
app.use("", require("./routes"));
// handle errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  return res.status(status).json({
    status: "Error",
    code: status,
    message: err.message || "Internal Server Error",
  });
});
continuousConsumer().catch(console.error);
(async () => {
  try {
    console.log("Starting consumer...");
    await runConsumerTaskOnDemand();
    console.log("Consumer started successfully.");
  } catch (error) {
    console.error("Error starting consumer:", error);
    process.exit(1); // Thoát ứng dụng với mã lỗi nếu không thể khởi động consumer
  }
})();
(async () => {
  try {
    console.log("Starting consumer...");
    await runConsumerUserOnDemand();
    console.log("Consumer started successfully.");
  } catch (error) {
    console.error("Error starting consumer:", error);
    process.exit(1); // Thoát ứng dụng với mã lỗi nếu không thể khởi động consumer
  }
})();
module.exports = app;
