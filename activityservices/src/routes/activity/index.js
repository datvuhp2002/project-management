"use strict";
const express = require("express");
const ActivityController = require("../../controllers/activity.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

// Lấy ra hết tất cả activity đã bị xoá
router.get("/admin/trash", asyncHandler(ActivityController.trash));

// Khôi phục một activity đã bị xoá
router.put("/admin/restore/:id", asyncHandler(ActivityController.restore));

// Lấy ra hết tất cả activity
router.get("/admin/getAll", asyncHandler(ActivityController.getAll));
router.get(
  "/admin/getAllActivitiesByUserProperty/:id",
  asyncHandler(ActivityController.getAllActivitiesByUserProperty)
);
router.get(
  "/getAllActivitiesByYourProperty",
  asyncHandler(ActivityController.getAllActivitiesByYourProperty)
);

// Xoá một activity theo id
router.delete("/admin/delete/:id", asyncHandler(ActivityController.delete));
// Lấy ra hết tất cả activity
router.get(
  "/getAllActivitiesFromTask/:id",
  asyncHandler(ActivityController.getAllActivitiesFromTask)
);
// Tạo ra một activity mới
router.post("/create", asyncHandler(ActivityController.create));
// Cập nhật một activity theo id
router.put("/update/:id", asyncHandler(ActivityController.update));

// Lấy ra chi tiết activity theo id
router.get("/detail/:id", asyncHandler(ActivityController.detail));

module.exports = router;
