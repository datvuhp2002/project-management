"use strict";
const express = require("express");
const UploadController = require("../../controllers/upload.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { uploadAvatar } = require("../../middleware/UploadAvatar");
const {
  uploadClient,
  uploadProject,
  uploadTask,
} = require("../../middleware/UploadFile");
const router = express.Router();
router.post("/get-file", asyncHandler(UploadController.getFile));
router.post("/get-avatar", asyncHandler(UploadController.getAvatar));
router.post(
  "/upload-avatar-from-local",
  uploadAvatar.single("file"),
  asyncHandler(UploadController.uploadAvatarFromLocal)
);
router.post(
  "/upload-file-for-task/:id",
  uploadTask.single("file"),
  asyncHandler(UploadController.uploadFileForTask)
);
router.post(
  "/upload-file-for-project/:id",
  uploadProject.single("file"),
  asyncHandler(UploadController.uploadFileForProject)
);

router.post("/getFileImage", asyncHandler(UploadController.getFileImage));
module.exports = router;
