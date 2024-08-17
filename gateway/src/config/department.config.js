"use strict";
const departmentServicesRoutes = {
  "/admin/get-all": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/create": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/create`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/delete": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/update": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/update`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/update": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/detail": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = departmentServicesRoutes;
