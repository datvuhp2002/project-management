"use strict";
const express = require("express");
const EmailController = require("../../controllers/email.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();
// Tìm người dùng bằng email
router.post("/new_template", asyncHandler(EmailController.newTemplate));
router.post("/verify-token", asyncHandler(EmailController.verifyToken));
module.exports = router;
