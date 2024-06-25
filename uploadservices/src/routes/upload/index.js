"use strict";
const express = require("express");
const UploadController = require("../../controllers/upload.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();
// Tìm người dùng bằng email
router.post(
  "/upload-image-from-url",
  asyncHandler(UploadController.uploadImageFromUrl)
);
router.post(
  "/upload-avatar-from-local",
  asyncHandler(UploadController.uploadFileAvatarFromLocal)
);
router.post(
  "/upload-avatar-from-local-files",
  asyncHandler(UploadController.uploadImageFromLocalFiles)
);
router.post("/upload-file", asyncHandler(UploadController.uploadFile));
module.exports = router;
