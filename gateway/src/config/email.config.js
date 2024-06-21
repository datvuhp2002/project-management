"use strict";
const emailServices = {
  "/verify-token": {
    target: `${process.env.EMAIL_SERVICES_REQUEST_URL}/verify-token`,
    authRequired: false,
    permissions: null,
  },
  "/forget-password": {
    target: `${process.env.EMAIL_SERVICES_REQUEST_URL}/forget-password`,
    authRequired: false,
    permissions: null,
  },
};
module.exports = emailServices;
