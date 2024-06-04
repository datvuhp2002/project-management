"use strict";
const express = require("express");
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware");
const { authentication } = require("../auth/authUtils");
const { permissionsAuthentication } = require("../auth/checkAuth");
const { SuccessResponse } = require("../core/success.response");
const { BadRequestError } = require("../core/error.response");
const router = express.Router();
router.use("/gateway/api/access", require("./access"));
const registerRouterServices = (basePath, routes, app) => {
  for (const route in routes) {
    const { target, authRequired, permissions, customHandler } = routes[route];
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
        selfHandleResponse: true, // Cho phép tự xử lý phản hồi
        on: {
          proxyReq: fixRequestBody,
          proxyRes: (proxyRes, req, res) => {
            let data = [];
            proxyRes.on('data', chunk => {
              data.push(chunk);
            });
            proxyRes.on('end', () => {
              const buffer = Buffer.concat(data);
              const responseString = buffer.toString('utf8');
              let responseData;
              try {
                responseData = JSON.parse(responseString);
              } catch (e) {
                responseData = responseString;
              }
              // Kiểm tra nếu có customHandler
              if (customHandler) {
                req.processedData = responseData;
                return customHandler(req, res);
              }
              res.send(responseData)
            });
          }
        }
      })
    );
    app.use(`${basePath}${route}`, middlewareChain);
  }
}
module.exports = { router, registerRouterServices};
