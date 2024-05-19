"use strict";
const express = require("express");
const router = express.Router();

// check permissions
router.use("/services/api/activity", require("./activity"));
module.exports = router;
