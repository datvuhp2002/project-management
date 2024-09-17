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

    // Xác thực middleware nếu cần
    if (authRequired) {
      middlewareChain.push(authentication);
      middlewareChain.push((req, res, next) => {
        if (req.user) {
          req.headers.user = req.user.userId;
        }
        next();
      });
    }

    // Phân quyền middleware nếu cần
    if (permissions) {
      middlewareChain.push(permissionsAuthentication(permissions));
    }

    // Proxy middleware
    middlewareChain.push(
      createProxyMiddleware({
        target,
        changeOrigin: true,
        on: {
          proxyReq: fixRequestBody,
        },
        onError: (err, req, res) => {
          console.error(`Proxy error: ${err.message}`);
          res.status(500).send("Proxy error");
        },
      })
    );

    // Thêm middleware chain vào app
    app.use(`${basePath}${route}`, middlewareChain);
  }
};

module.exports = { router, registerRouterServices };
