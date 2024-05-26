"use strict";
const activityServicesRoutes = {
  "/admin/restore": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/getAll": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/getAllActivitiesByUserProperty": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/getAllActivitiesByUserProperty`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/delete": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/getAllActivitiesByYourProperty": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesByYourProperty`,
    authRequired: true,
    permissions: null,
  },
  "/getAllActivitiesFromTask": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesFromTask`,
    authRequired: true,
    permissions: null,
  },
  "/create": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: null,
  },
  "/update": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: null,
  },
  "/detail": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/getAllActivitiesByYear": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesByYear`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = activityServicesRoutes;
