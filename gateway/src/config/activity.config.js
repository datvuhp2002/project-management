"use strict";
const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log('Data from server:', responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway"
  res.send(responseData);
};
const activityServicesRoutes = {
  "/admin/restore": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/admin/trash": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/admin/get-all": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/admin/get-all-activities-by-user-property": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/getAllActivitiesByUserProperty`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/admin/delete": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/get-all-activities-by-your-property": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesByYourProperty`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/get-all-activities-from-task": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesFromTask`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
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
    customHandler: customConsoleHandler
  },

};
module.exports = activityServicesRoutes;
