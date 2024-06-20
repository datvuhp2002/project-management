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
const assignmentProto = grpc.loadPackageDefinition(
  packageAssignmentDefinition
).assignment;
const assignmentClient = new assignmentProto.AssignmentService(
  process.env.ASSIGNMENT_GRPC_PORT,
  grpc.credentials.createInsecure()
);
async function getTotalTaskWithStatusFromProjectAndTotalStaff(project_id) {
  if (project_id == null) return null;
  console.log(project_id);
  return new Promise((resolve, reject) => {
    assignmentClient.getTotalTaskWithStatusFromProjectAndTotalStaff(
      { project_id },
      (err, response) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(response);
        }
      }
    );
  });
}
module.exports = { getTotalTaskWithStatusFromProjectAndTotalStaff };
