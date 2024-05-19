"use strict";
const express = require("express");
const router = express.Router();

// check permissions
router.use("/services/api/department", require("./department"));
module.exports = router;
