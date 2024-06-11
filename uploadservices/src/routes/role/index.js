"use strict";
const express = require("express");
const roleController = require("../../controllers/role.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

// create
router.post("/create", asyncHandler(roleController.create));
// getAll
router.get("/getAll", asyncHandler(roleController.getAll));
// find by Id
router.post("/detail/:id", asyncHandler(roleController.detail));
module.exports = router;
