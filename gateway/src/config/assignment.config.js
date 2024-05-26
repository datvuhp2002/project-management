"use strict";
const assignmentServicesRoutes = {
  "/admin/getAll": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/getAllUserPropertyFromProject": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllUserPropertyFromProject`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getAllTaskPropertyFromProject": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllTaskPropertyFromProject`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/removeStaffFromProject": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/removeStaffFromProject`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/create": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/update": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/detail": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/delete": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/delete`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
};
module.exports = assignmentServicesRoutes;
