"use strict";
const express = require("express");
const DepartmentController = require("../../controllers/department.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

// Lấy ra hết tất cả department
router.get("/admin/getAll", asyncHandler(DepartmentController.getAll));

// Lấy ra hết tất cả department đã bị xoá
router.get("/admin/trash", asyncHandler(DepartmentController.trash));

// Tạo ra một department mới
router.post("/admin/create", asyncHandler(DepartmentController.create));

// Cập nhật một department theo id
router.put("/update/:id", asyncHandler(DepartmentController.updateForManager));
// Cập nhật một department theo id
router.put("/admin/update/:id", asyncHandler(DepartmentController.update));

// Lấy ra chi tiết department theo id
router.get("/detail/:id", asyncHandler(DepartmentController.detail));

// Xoá một department theo id
router.delete("/admin/delete/:id", asyncHandler(DepartmentController.delete));

// Khôi phục một department đã bị xoá
router.put("/admin/restore/:id", asyncHandler(DepartmentController.restore));

module.exports = router;
