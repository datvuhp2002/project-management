"use strict";
const roleRoutes = {
  "/getAll": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/role/getAll`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
};

module.exports = roleRoutes;
