"use strict";
const express = require("express");
const UserNotificationController = require("../../controllers/user_notification.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

router.get(
  "/get-user-notifications",
  asyncHandler(UserNotificationController.getAllNotificationsOfUser)
);
router.put(
  "/mark-as-read/:id",
  asyncHandler(UserNotificationController.markAsRead)
);

module.exports = router;
