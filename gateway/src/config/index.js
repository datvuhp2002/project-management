"use strict";
const emailServices = require("./email.config");
const roleRoutes = require("./role.config");
const userServicesRoutes = require("./user.config");
const departmentServicesRoutes = require("./department.config");
const projectServicesRoutes = require("./project.config");
const assignmentServicesRoutes = require("./assignment.config");
const taskServicesRoutes = require("./task.config");
const activityServicesRoutes = require("./activity.config");
const uploadServicesRoutes = require("./upload.config");
const userNotificationsServicesRouter = require("./user_notifications.config");
const notificationsServicesRouter = require("./notifications.config");
module.exports = {
  emailServices,
  roleRoutes,
  userServicesRoutes,
  projectServicesRoutes,
  departmentServicesRoutes,
  assignmentServicesRoutes,
  taskServicesRoutes,
  activityServicesRoutes,
  uploadServicesRoutes,
  notificationsServicesRouter,
  userNotificationsServicesRouter,
};
