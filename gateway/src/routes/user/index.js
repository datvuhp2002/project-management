"use strict";
const express = require("express");
const access = require("../../controllers/gateway.user.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { permissionsAuthentication } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();
// router.use(authentication);
router.get(
  "/findByEmail/:email",
  asyncHandler(access.findByEmail)
);
module.exports = router;
