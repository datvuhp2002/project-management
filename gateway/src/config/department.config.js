"use strict";
const departmentServicesRoutes = {
  "/admin/getAll": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/create": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/create`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/delete": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/update": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["MANAGER"],
  },
  "/admin/update": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/update`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/detail": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = departmentServicesRoutes;
