"use strict";
const notificationsServicesRouter = {
  "/get-all": {
    target: `${process.env.NOTIFICATIONS_SERVICES_REQUEST_URL}/get-all`,
    authRequired: false,
    permissions: null,
  },
};
module.exports = notificationsServicesRouter;
