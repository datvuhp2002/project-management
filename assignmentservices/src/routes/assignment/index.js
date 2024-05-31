"use strict";
const express = require("express");
const AssignmentController = require("../../controllers/assignment.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const router = express.Router();

// get all assignments
router.get("/admin/getAll", asyncHandler(AssignmentController.getAll));
router.get(
  "/getAllAssignmentForUser/:id",
  asyncHandler(AssignmentController.getAllAssignmentForUser)
);
router.get(
  "/getAllAssignmentForProject/:id",
  asyncHandler(AssignmentController.getAllAssignmentForProject)
);
// get all staff from project
router.get(
  "/getAllUserPropertyFromProject/:id",
  asyncHandler(AssignmentController.getAllUserPropertyFromProject)
);
router.get(
  "/getAllAssignmentForTask/:id",
  asyncHandler(AssignmentController.getAllAssignmentForTask)
);
router.get(
  "/getAllTaskPropertyFromProject/:id",
  asyncHandler(AssignmentController.getAllTaskPropertyFromProject)
);
router.delete(
  "/removeStaffFromProject/:id",
  asyncHandler(AssignmentController.removeStaffFromProject)
);
// get all assignments has been deleted
router.get("/admin/trash", asyncHandler(AssignmentController.trash));

// create a new assignment
router.post("/create", asyncHandler(AssignmentController.create));

// update assignment by id
router.put("/update/:id", asyncHandler(AssignmentController.update));

// get information about assignment
router.get("/detail/:id", asyncHandler(AssignmentController.detail));

// delete assignment by id
router.delete("/delete/:id", asyncHandler(AssignmentController.delete));

// restore assignment has been delete by id
router.put("/admin/restore/:id", asyncHandler(AssignmentController.restore));

module.exports = router;
