"use strict";
const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log("Data from server:", responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway";
  res.send(responseData);
};
const activityServicesRoutes = {
  "/admin/restore": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
  "/get-all-activities": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivities`,
    authRequired: true,
    permissions: null,
  },
  "/admin/delete": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
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
  "/get-all-activities-by-year": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesByYear`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = activityServicesRoutes;
