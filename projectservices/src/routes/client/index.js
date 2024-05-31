"use strict";
const express = require("express");
const ClientController = require("../../controllers/client.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { uploadClient } = require("../../middleware");
const router = express.Router();

// get list of clients
router.get("/admin/getAll", asyncHandler(ClientController.getAll));
// restore client has been deleted
router.put("/admin/restore/:id", asyncHandler(ClientController.restore));
// list clients has been deleted
router.get("/admin/trash", asyncHandler(ClientController.trash));
// delete client
router.delete("/admin/delete/:id", asyncHandler(ClientController.delete));
router.get("/detail/:id", asyncHandler(ClientController.detail));
// get list of clients from project
router.get(
  "/getAllClientFromProject/:id",
  asyncHandler(ClientController.getAllClientFromProject)
);
// create client
router.post("/create", asyncHandler(ClientController.create));
// find by Id
router.post("/detail/:id", asyncHandler(ClientController.detail));
// update
router.put("/update/:id", asyncHandler(ClientController.update));

// upload avatar on cloud
router.post(
  "/uploadAvatarFromLocal/:id",
  uploadClient.single("file"),
  asyncHandler(ClientController.uploadFileAvatarFromLocal)
);
// get avatar from cloud
router.post("/getAvatar", asyncHandler(ClientController.getAvatar));
module.exports = router;
