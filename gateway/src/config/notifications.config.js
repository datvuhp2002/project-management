"use strict";
const notificationsServicesRouter = {
  "/get-all": {
    target: `${process.env.NOTIFICATIONS_SERVICES_REQUEST_URL}/get-all`,
    authRequired: true,
    permissions: ["SUPER_ADMIN", "ADMIN"],
  },
};
module.exports = notificationsServicesRouter;
