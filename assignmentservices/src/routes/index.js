"use strict";
const express = require("express");
const router = express.Router();

// check permissions
router.use("/services/api/assignment", require("./assignment"));
module.exports = router;
