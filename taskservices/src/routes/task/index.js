"use strict";
const express = require("express");
const TaskController = require("../../controllers/task.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { uploadFile } = require("../../middleware");
const router = express.Router();

// Lấy ra hết tất cả task
router.get("/admin/getAll", asyncHandler(TaskController.getAll));
// get list task from project
router.post(
  "/getAllTaskByTaskIds",
  asyncHandler(TaskController.getAllTaskByTaskIds)
);
// Lấy ra hết tất cả task đã bị xoá
router.get("/admin/trash", asyncHandler(TaskController.trash));

// Tạo ra một task mới
router.post("/create", asyncHandler(TaskController.create));

// Cập nhật một task theo id
router.put("/update/:id", asyncHandler(TaskController.update));

// Lấy ra chi tiết task theo id
router.get("/detail/:id", asyncHandler(TaskController.detail));

router.get(
  "/getAllTaskInProject/:id",
  asyncHandler(TaskController.getAllTaskInProject)
);
router.post("/getFile", asyncHandler(TaskController.getFile));
// Xoá một task theo id
router.delete("/admin/delete/:id", asyncHandler(TaskController.delete));

// Khôi phục một task đã bị xoá
router.put("/admin/restore/:id", asyncHandler(TaskController.restore));

router.post(
  "/uploadFileFromLocal/:id",
  uploadFile.single("file"),
  asyncHandler(TaskController.uploadFileFromLocal)
);
router.post("/getFileImage", asyncHandler(TaskController.getFileImage));
router.post("/deleteFile/:id", asyncHandler(TaskController.deleteFile));
module.exports = router;
