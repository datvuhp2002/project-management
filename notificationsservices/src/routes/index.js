"use strict";
const express = require("express");
const router = express.Router();

// check permissions
router.use("/services/api/notification", require("./notification"));
module.exports = router;
