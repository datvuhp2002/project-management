"use strict";
const AssignmentService = require("./assignment.service");
const grpc = require("@grpc/grpc-js");

async function getAllTaskFromProject(call, callback) {
  const { project_id } = call.request;
  try {
    const listAssignment = await AssignmentService.getAllTaskFromProject(
      project_id
    );
    const response = {
      ids: listAssignment,
    };
    if (listAssignment) {
      callback(null, response);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Assignment not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}
async function getAllUserFromProject(call, callback) {
  const { project_id } = call.request;
  try {
    const listAssignment = await AssignmentService.getAllUserFromProject(
      project_id
    );
    const response = {
      ids: listAssignment,
    };
    if (listAssignment) {
      callback(null, response);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Assignment not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}

async function getTotalTaskWithStatusFromProjectAndTotalStaff(call, callback) {
  const { project_id } = call.request;
  try {
    const result =
      await AssignmentService.getTotalTaskWithStatusFromProjectAndTotalStaff(
        project_id
      );
    if (result) {
      callback(null, result);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Assignment not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}
async function getAllUserProject(call, callback) {
  const { user_id } = call.request;
  try {
    const result = await AssignmentService.getAllUserProject(user_id);
    const response = {
      ids: result,
    };
    if (result) {
      callback(null, response);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Assignment not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}
module.exports = {
  getAllTaskFromProject,
  getAllUserFromProject,
  getTotalTaskWithStatusFromProjectAndTotalStaff,
  getAllUserProject,
};
