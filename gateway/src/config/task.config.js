"use strict";
const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log("Data from server:", responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway";
  res.send(responseData);
};
const taskServicesRoutes = {
  "/admin/get-all": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/create": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: null,
  },
  "/update": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: null,
  },
  "/detail": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/delete": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/delete`,
    authRequired: true,
    permissions: null,
  },
  "/get-file-image": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getFileImage`,
    authRequired: true,
    permissions: null,
  },
  "/get-file": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getFile`,
    authRequired: true,
    permissions: null,
  },
  "/get-all-task-in-project": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getAllTaskInProject`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = taskServicesRoutes;
