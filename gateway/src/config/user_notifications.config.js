"use strict";
const userNotificationsServicesRouter = {
  "/get-user-notifications": {
    target: `${process.env.USER_NOTIFICATIONS_SERVICES_REQUEST_URL}/get-user-notifications`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = userNotificationsServicesRouter;
