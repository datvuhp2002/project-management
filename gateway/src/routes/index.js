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
router.use("/report", require("./report"));
const registerRouterServices = (basePath, routes, app) => {
  for (const route in routes) {
    const { target, authRequired, permissions } = routes[route];
    const middlewareChain = [];
    if (authRequired) {
      middlewareChain.push(authentication);
      middlewareChain.push((req, res, next) => {
        if (req.user) {
          req.headers.user = req.user.userId;
        }
        next();
      });
    }
    if (permissions) {
      middlewareChain.push(permissionsAuthentication(permissions));
    }
    middlewareChain.push((req, res, next) => {
      console.log(`Proxy request for ${basePath}${route} to ${target}`);
      next();
    });
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
