require("dotenv").config();
const express = require("express");
const compression = require("compression");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { router, registerRouterServices } = require("./routes");
const {
  emailServices,
  roleRoutes,
  userServicesRoutes,
  departmentServicesRoutes,
  assignmentServicesRoutes,
  projectServicesRoutes,
  taskServicesRoutes,
  activityServicesRoutes,
  uploadServicesRoutes,
} = require("./config");
const cors = require("cors");
const app = express();
const GatewayLogger = require("./loggers/gateway.log");
const { v4: uuidv4 } = require("uuid");

// init middleware
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// init routes
app.use(router);
registerRouterServices("/departments", departmentServicesRoutes, app);
registerRouterServices("/email", emailServices, app);
registerRouterServices("/roles", roleRoutes, app);
registerRouterServices("/users", userServicesRoutes, app);
registerRouterServices("/assignments", assignmentServicesRoutes, app);
registerRouterServices("/projects", projectServicesRoutes, app);
registerRouterServices("/tasks", taskServicesRoutes, app);
registerRouterServices("/activities", activityServicesRoutes, app);
registerRouterServices("/upload", uploadServicesRoutes, app);
app.use((req, res, next) => {
  const requestId = req.user;
  req.requestId = requestId ? requestId : uuidv4();
  GatewayLogger.log(`input params:-:${req.method}:-:`, [
    req.path,
    { requestId: req.requestId },
    req.method === "POST" ? req.body : req.query,
  ]);
  next();
});
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const resMessage = `${err.status}:-:${
    Date.now() - err.now
  }ms:-:Response:${JSON.stringify(err)}`;
  GatewayLogger.error(resMessage, [
    req.path,
    {
      requestId: req.requestId,
    },
    {
      message: err.message,
    },
  ]);
  // init logger
  return res.status(status).json({
    status: "Error",
    code: status,
    stack: err.stack,
    message: err.message || "Internal Server Error",
  });
});
module.exports = app;
