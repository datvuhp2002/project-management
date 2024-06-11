"use strict";
const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log("Data from server:", responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway";
  res.send(responseData);
};
const clientRoutes = {
  "/admin/get-all": {
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
  "/get-all-client-from-project": {
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

  "/upload-avatar-from-local": {
    target: `${process.env.CLIENT_REQUEST_URL}/uploadAvatarFromLocal`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/get-avatar": {
    target: `${process.env.CLIENT_REQUEST_URL}/getAvatar`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
};
module.exports = clientRoutes;
