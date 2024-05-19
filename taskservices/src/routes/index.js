"use strict";
const express = require("express");
const router = express.Router();

// check permissions
router.use("/services/api/task", require("./task"));
module.exports = router;
