"use strict";
const express = require("express");
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware");
const { authentication } = require("../auth/authUtils");
const { permissionsAuthentication } = require("../auth/checkAuth");
const router = express.Router();

router.use("/gateway/api/access", require("./access"));
router.use("/users",require("./user"))
const registerRouterServices = (basePath, routes, app) => {
  for (const route in routes) {
    const { target, authRequired, permissions } = routes[route];
    const middlewareChain = [];
    if (authRequired) {
      middlewareChain.push(authentication);
      middlewareChain.push((req, res, next) => {
        if (req.user) {
          req.headers.user = req.user.userId;
          req.headers.user_property = req.user.userProperty;
        }
        next();
      });
    }
    if (permissions) {
      middlewareChain.push(permissionsAuthentication(permissions));
    }

    middlewareChain.push(
      createProxyMiddleware({
        target,
        changeOrigin: true,
        on: {
          proxyReq: fixRequestBody,
        },
      })
    );
    app.use(`${basePath}${route}`, middlewareChain);
  }
};

module.exports = { router, registerRouterServices };
