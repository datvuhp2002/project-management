"use strict";
const express = require("express");
const router = express.Router();

// check permissions
router.use("/services/api/project/client", require("./client"));
router.use("/services/api/project", require("./project"));
module.exports = router;
