"use strict";
const emailRoutes = {
  "/verify-token": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/email/verify-token`,
    authRequired: false,
    permissions: null,
  },
};
module.exports = emailRoutes;
