"use strict";
const taskServicesRoutes = {
  "/admin/getAll": {
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
  "/uploadFileFromLocal": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/uploadFileFromLocal`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getFileImage": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getFileImage`,
    authRequired: true,
    permissions: null,
  },
  "/getFile": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getFile`,
    authRequired: true,
    permissions: null,
  },
  "/deleteFile": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/deleteFile`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getAllTaskByTaskProperty": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getAllTaskByTaskProperty`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = taskServicesRoutes;
