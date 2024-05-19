require("dotenv").config();
const express = require("express");
const compression = require("compression");

const axios = require("axios");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { router, registerRouterServices } = require("./routes");
const {
  emailRoutes,
  roleRoutes,
  userServicesRoutes,
  departmentServicesRoutes,
  assignmentServicesRoutes,
  projectServicesRoutes,
  clientRoutes,
  taskServicesRoutes,
  activityServicesRoutes,
} = require("./config");

const app = express();

// init middleware
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extend: true }));
// init routes
app.use(router);
registerRouterServices("/email", emailRoutes, app);
registerRouterServices("/roles", roleRoutes, app);
registerRouterServices("/users", userServicesRoutes, app);
registerRouterServices("/departments", departmentServicesRoutes, app);
registerRouterServices("/assignments", assignmentServicesRoutes, app);
registerRouterServices("/projects", projectServicesRoutes, app);
registerRouterServices("/clients", clientRoutes, app);
registerRouterServices("/tasks", taskServicesRoutes, app);
registerRouterServices("/activities", activityServicesRoutes, app);
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
