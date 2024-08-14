"use strict";
const ActivityService = require("./activity.service");
const grpc = require("@grpc/grpc-js");

async function totalActivity(call, callback) {
  const { task_id } = call.request;
  console.log("Task ID:::", task_id);
  try {
    const total = await ActivityService.totalActivity(task_id);
    console.log("Result:::", total);
    if (total !== undefined && total !== null) {
      callback(null, { total });
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Activity not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}

module.exports = { totalActivity };
