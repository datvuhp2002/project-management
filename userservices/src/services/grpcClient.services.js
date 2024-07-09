"use strict";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const ASSIGNMENT_PROTO_PATH = path.join(__dirname, "../grpc/assignment.proto");
const UPLOAD_PROTO_PATH = path.join(__dirname, "../grpc/upload.proto");
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
async function GetAllUserFromProject(project_id) {
  if (project_id == null) return null;
  return new Promise((resolve, reject) => {
    assignmentClient.getAllUserFromProject({ project_id }, (err, response) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(response.ids);
      }
    });
  });
}
const packageUploadDefinition = protoLoader.loadSync(UPLOAD_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const uploadProto = grpc.loadPackageDefinition(packageUploadDefinition).upload;
const uploadClient = new uploadProto.UploadService(
  process.env.UPLOAD_GRPC_PORT,
  grpc.credentials.createInsecure()
);
async function GetAvatar(avatar) {
  if (avatar == null) return null;
  return new Promise((resolve, reject) => {
    uploadClient.getAvatar({ avatar }, (err, response) => {
      if (err) {
        console.log(err.message);
        reject(err.message);
      } else {
        resolve(response.avatar);
      }
    });
  });
}
module.exports = { GetAllUserFromProject, GetAvatar };
