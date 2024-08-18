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
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/delete": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/delete`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN", "MANAGER", "PROJECT_MANAGER"],
  },
  "/admin/force-delete": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/forceDelete`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/get-all-user-project": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/getAllUserProject`,
    authRequired: true,
    permissions: null,
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
    permissions: null,
  },
  "/create": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN", "MANAGER", "PROJECT_MANAGER"],
  },
  "/update": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN", "MANAGER", "PROJECT_MANAGER"],
  },
  "/detail": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = projectServicesRoutes;
