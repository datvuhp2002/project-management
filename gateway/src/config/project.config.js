"use strict";
const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log("Data from server:", responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway";
  res.send(responseData);
};
const projectServicesRoutes = {
  "/admin/get-all": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/delete": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/delete`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/get-all-user-project-in-department": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/getAllUserProjectInDepartment`,
    authRequired: true,
    permissions: null,
  },
  "/get-all-info-project-in-department": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/getAllInfoProjectInDepartment`,
    authRequired: true,
    permissions: null,
  },
  "/get-all-project-in-department": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/getAllProjectInDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER", "PROJECT_MANAGER"],
  },
  "/create": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/update": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/detail": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/upload-file-from-local": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/uploadFileFromLocal`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/get-file-image": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/getFileImage`,
    authRequired: true,
    permissions: null,
  },
  "/get-file": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/getFile`,
    authRequired: true,
    permissions: null,
  },
  "/delete-file": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/deleteFile`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
};
module.exports = projectServicesRoutes;
