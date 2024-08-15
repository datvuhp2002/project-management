"use strict";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const USER_PROTO_PATH = path.join(__dirname, "../grpc/user.proto");
const TASK_PROTO_PATH = path.join(__dirname, "../grpc/task.proto");
const PROJECT_PROTO_PATH = path.join(__dirname, "../grpc/project.proto");
const packageUserDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const packageTaskDefinition = protoLoader.loadSync(TASK_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const packageProjectDefinition = protoLoader.loadSync(PROJECT_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageUserDefinition).user;
const taskProto = grpc.loadPackageDefinition(packageTaskDefinition).task;
const projectProto = grpc.loadPackageDefinition(
  packageProjectDefinition
).project;

const userClient = new userProto.UserService(
  process.env.USER_GRPC_PORT,
  grpc.credentials.createInsecure()
);
const taskClient = new taskProto.TaskService(
  process.env.TASK_GRPC_PORT,
  grpc.credentials.createInsecure()
);
const projectClient = new projectProto.ProjectService(
  process.env.PROJECT_GRPC_PORT,
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
async function getTask(task_id) {
  if (task_id == null) return null;
  return new Promise((resolve, reject) => {
    taskClient.getTask({ task_id }, (err, response) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(response);
      }
    });
  });
}
async function getProject(project_id) {
  if (project_id == null) return null;
  return new Promise((resolve, reject) => {
    projectClient.getProject({ project_id }, (err, response) => {
      if (err) {
        console.log(err.message);
        reject(err.message);
      } else {
        console.log(response);
        resolve(response);
      }
    });
  });
}
async function getListProjectInDepartment(department_id) {
  if (department_id == null) return null;
  return new Promise((resolve, reject) => {
    projectClient.getListProjectInDepartment(
      { department_id },
      (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.ids);
        }
      }
    );
  });
}
module.exports = { getUser, getTask, getProject, getListProjectInDepartment };
