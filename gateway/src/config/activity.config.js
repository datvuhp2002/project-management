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
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/get-all": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/get-all-activities-by-user": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/getAllActivitiesByUser`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/delete": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/get-all-your-activities": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllYourActivities`,
    authRequired: true,
    permissions: null,
  },
  "/get-all-activities-from-task": {
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
  "/get-all-activities-by-year": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesByYear`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = activityServicesRoutes;
