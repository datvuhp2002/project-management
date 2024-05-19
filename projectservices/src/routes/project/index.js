"use strict";
const express = require("express");
const ProjectController = require("../../controllers/project.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { uploadProject } = require("../../middleware");
const router = express.Router();

// Lấy ra hết tất cả project
router.get("/admin/getAll", asyncHandler(ProjectController.getAll));
router.get(
  "/getAllProjectInDepartment/:id",
  asyncHandler(ProjectController.getAllProjectInDepartment)
);
// Khôi phục một project đã bị xoá
router.put("/admin/restore/:id", asyncHandler(ProjectController.restore));

// Xoá một project theo id
router.delete("/admin/delete/:id", asyncHandler(ProjectController.delete));

// Lấy ra hết tất cả project đã bị xoá
router.get("/admin/trash", asyncHandler(ProjectController.trash));

// Tạo ra một project mới
router.post("/create", asyncHandler(ProjectController.create));

// Cập nhật một project theo id
router.put("/update/:id", asyncHandler(ProjectController.update));

// Lấy ra chi tiết project theo id
router.get("/detail/:id", asyncHandler(ProjectController.detail));

router.post(
  "/uploadFileFromLocal/:id",
  uploadProject.single("file"),
  asyncHandler(ProjectController.uploadFileFromLocal)
);
router.post("/getFileImage", asyncHandler(ProjectController.getFileImage));
router.post("/getFile", asyncHandler(ProjectController.getFile));
router.post("/deleteFile/:id", asyncHandler(ProjectController.deleteFile));
module.exports = router;
