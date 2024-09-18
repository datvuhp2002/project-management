"use strict";
const userNotificationsServicesRouter = {
  "/get-user-notifications": {
    target: `${process.env.USER_NOTIFICATIONS_SERVICES_REQUEST_URL}/get-user-notifications`,
    authRequired: true,
    permissions: null,
  },
  "/mark-as-read": {
    target: `${process.env.USER_NOTIFICATIONS_SERVICES_REQUEST_URL}/mark-as-read`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = userNotificationsServicesRouter;
