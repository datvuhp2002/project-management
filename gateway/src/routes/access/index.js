"use strict";
const express = require("express");
const accessController = require("../../controllers/access.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { permissionsAuthentication } = require("../../auth/checkAuth");

const { authentication } = require("../../auth/authUtils");
const router = express.Router();

// signIn
router.post("/login", asyncHandler(accessController.login));

// AUTHENTICATION
router.use(authentication);
router.get(
  "/handle-refresh-token",
  asyncHandler(accessController.handleRefreshToken)
);

module.exports = router;
