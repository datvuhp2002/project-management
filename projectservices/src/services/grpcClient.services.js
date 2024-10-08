"use strict";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const ASSIGNMENT_PROTO_PATH = path.join(__dirname, "../grpc/assignment.proto");
const USER_PROTO_PATH = path.join(__dirname, "../grpc/user.proto");
const DEPARTMENT_PROTO_PATH = path.join(__dirname, "../grpc/department.proto");

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
const packageUserDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageUserDefinition).user;
const assignmentProto = grpc.loadPackageDefinition(
  packageAssignmentDefinition
).assignment;

const assignmentClient = new assignmentProto.AssignmentService(
  process.env.ASSIGNMENT_GRPC_PORT,
  grpc.credentials.createInsecure()
);
const userClient = new userProto.UserService(
  process.env.USER_GRPC_PORT,
  grpc.credentials.createInsecure()
);

async function getUser(user_id) {
  if (user_id == null) return null;
  return new Promise((resolve, reject) => {
    userClient.GetUser({ user_id }, (err, response) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(response);
      }
    });
  });
}
async function getTotalTaskWithStatusFromProjectAndTotalStaff(project_id) {
  if (project_id == null) return null;
  return new Promise((resolve, reject) => {
    assignmentClient.getTotalTaskWithStatusFromProjectAndTotalStaff(
      { project_id },
      (err, response) => {
        if (err) {
          reject(err);
          console.log(err);
        } else {
          resolve(response);
        }
      }
    );
  });
}
async function getAllUserProject(user_id) {
  if (user_id == null) return null;
  return new Promise((resolve, reject) => {
    assignmentClient.getAllUserProject({ user_id }, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.ids);
      }
    });
  });
}

// DEPARTMENT
const packageDepartmentDefinition = protoLoader.loadSync(
  DEPARTMENT_PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);
const departmentProto = grpc.loadPackageDefinition(
  packageDepartmentDefinition
).department;
const departmentClient = new departmentProto.DepartmentService(
  process.env.DEPARTMENT_GRPC_PORT,
  grpc.credentials.createInsecure()
);
async function GetDepartment(department_id) {
  if (department_id == null) return null;
  return new Promise((resolve, reject) => {
    departmentClient.GetDepartment({ department_id }, (err, response) => {
      if (err) {
        console.log(err.message);
        reject(err.message);
      } else {
        resolve(response);
      }
    });
  });
}
module.exports = {
  getUser,
  getTotalTaskWithStatusFromProjectAndTotalStaff,
  getAllUserProject,
  GetDepartment,
};
