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
router.delete("/delete/:id", asyncHandler(UserNotificationController.delete));
router.put("/read-many", asyncHandler(UserNotificationController.readMany));

module.exports = router;
