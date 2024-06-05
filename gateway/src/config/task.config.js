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
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/create": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/update": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/detail": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/admin/delete": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/upload-file-from-local": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/uploadFileFromLocal`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
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
  "/delete-file": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/deleteFile`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/get-all-task-by-task-property": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getAllTaskByTaskProperty`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = taskServicesRoutes;
