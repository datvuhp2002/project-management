"use strict";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const ASSIGNMENT_PROTO_PATH = path.join(__dirname, "../grpc/assignment.proto");
const packageAssignmentDefinition = protoLoader.loadSync(
  ASSIGNMENT_PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

// Assignment
const assignmentProto = grpc.loadPackageDefinition(
  packageAssignmentDefinition
).assignment;
const assignmentClient = new assignmentProto.AssignmentService(
  process.env.ASSIGNMENT_GRPC_PORT,
  grpc.credentials.createInsecure()
);
async function GetAllTaskFromProject(project_id) {
  if (project_id == null) return null;
  return new Promise((resolve, reject) => {
    assignmentClient.getAllTaskFromProject({ project_id }, (err, response) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(response.ids);
      }
    });
  });
}
// Activity
const ACTIVITY_PROTO_PATH = path.join(__dirname, "../grpc/activity.proto");
const packageActivityDefinition = protoLoader.loadSync(ACTIVITY_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const activityProto = grpc.loadPackageDefinition(
  packageActivityDefinition
).activity;
const activityClient = new activityProto.ActivityService(
  process.env.ACTIVITY_GRPC_PORT,
  grpc.credentials.createInsecure()
);
async function TotalActivity(task_id) {
  if (task_id == null) return null;
  return new Promise((resolve, reject) => {
    activityClient.totalActivity({ task_id }, (err, response) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(response.total);
      }
    });
  });
}
module.exports = { GetAllTaskFromProject, TotalActivity };
