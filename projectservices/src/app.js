require("dotenv").config();
const express = require("express");
const compression = require("compression");
const { default: helmet } = require("helmet");
const morgan = require("morgan");

const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extend: true }));
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
    stack: err.stack,
    message: err.message || "Internal Server Error",
  });
});
module.exports = app;
