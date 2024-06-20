"use strict";
const express = require("express");
const router = express.Router();

// check permissions
router.use("/services/api/user/email", require("./email"));
module.exports = router;
