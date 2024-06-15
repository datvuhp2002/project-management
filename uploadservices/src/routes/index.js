"use strict";
const express = require("express");
const router = express.Router();
router.use("/services/api/upload", require("./upload"));
module.exports = router;
