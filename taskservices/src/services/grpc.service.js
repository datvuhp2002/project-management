"use strict";
const TaskServices = require("./task.service");
const grpc = require("@grpc/grpc-js");

async function GetTask(call, callback) {
  const { task_id } = call.request;
  try {
    const task = await TaskServices.detail(task_id);
    if (task) {
      callback(null, task);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Task not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}

module.exports = { GetTask };
