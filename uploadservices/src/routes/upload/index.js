"use strict";
const express = require("express");
const UploadController = require("../../controllers/upload.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { uploadAvatar } = require("../../middleware/UploadAvatar");
const router = express.Router();
router.post(
  "/upload-avatar-from-local",
  uploadAvatar.single("file"),
  asyncHandler(UploadController.uploadAvartarFromLocal)
);
router.post("/get-file", asyncHandler(UploadController.getFile));
router.post("/upload-file", asyncHandler(UploadController.uploadFile));
module.exports = router;
