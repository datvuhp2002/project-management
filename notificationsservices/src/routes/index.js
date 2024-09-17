"use strict";
const express = require("express");
const router = express.Router();

// check permissions
router.use("/services/api/notifications", require("./notification"));
router.use("/services/api/user-notifications", require("./user_notification"));
module.exports = router;
