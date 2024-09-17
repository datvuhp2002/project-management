"use strict";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Initialize the User Service
const USER_PROTO_PATH = path.join(__dirname, "../grpc/user.proto");
const packageDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// Initialize the Assignment Service
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

// User gRPC server
const userClient = new userProto.UserService(
  process.env.USER_GRPC_PORT,
  grpc.credentials.createInsecure()
);

async function getUser(user_id) {
  return new Promise((resolve, reject) => {
    userClient.getUser({ user_id }, (err, response) => {
      if (err) {
        resolve(null);
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}
async function GetListStaffInDepartment(department_id) {
  if (!department_id) return null;
  return new Promise((resolve, reject) => {
    userClient.getListStaffInDepartment({ department_id }, (err, response) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(response.ids);
      }
    });
  });
}
async function GetListAllAdministrators() {
  return new Promise((resolve, reject) => {
    userClient.GetListAllAdministrators({}, (err, response) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(response.ids);
      }
    });
  });
}

// Assignment gRPC server
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
module.exports = {
  getUser,
  GetListStaffInDepartment,
  GetListAllAdministrators,
  GetAllUserFromProject,
};
