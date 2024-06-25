"use strict";
const emailServices = require("./email.config");
const roleRoutes = require("./role.config");
const userServicesRoutes = require("./user.config");
const departmentServicesRoutes = require("./department.config");
const projectServicesRoutes = require("./project.config");
const assignmentServicesRoutes = require("./assignment.config");
const clientRoutes = require("./client.config");
const taskServicesRoutes = require("./task.config");
const activityServicesRoutes = require("./activity.config");
const uploadServicesRoutes = require("./upload.config");
module.exports = {
  emailServices,
  roleRoutes,
  userServicesRoutes,
  projectServicesRoutes,
  departmentServicesRoutes,
  assignmentServicesRoutes,
  clientRoutes,
  taskServicesRoutes,
  activityServicesRoutes,
  uploadServicesRoutes,
};
