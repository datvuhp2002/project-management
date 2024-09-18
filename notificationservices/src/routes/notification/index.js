"use strict";
const express = require("express");
const NotificationController = require("../../controllers/notification.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

router.get("/get-all", asyncHandler(NotificationController.getAll));

module.exports = router;
