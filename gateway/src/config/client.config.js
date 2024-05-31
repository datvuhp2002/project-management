"use strict";
const clientRoutes = {
  "/admin/getAll": {
    target: `${process.env.CLIENT_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.CLIENT_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.CLIENT_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/delete": {
    target: `${process.env.CLIENT_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/getAllClientFromProject": {
    target: `${process.env.CLIENT_REQUEST_URL}/getAllClientFromProject`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/detail": {
    target: `${process.env.CLIENT_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/create": {
    target: `${process.env.CLIENT_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/update": {
    target: `${process.env.CLIENT_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/detail": {
    target: `${process.env.CLIENT_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },

  "/uploadAvatarFromLocal": {
    target: `${process.env.CLIENT_REQUEST_URL}/uploadAvatarFromLocal`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getAvatar": {
    target: `${process.env.CLIENT_REQUEST_URL}/getAvatar`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
};
module.exports = clientRoutes;
