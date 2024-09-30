"use strict";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const USER_PROTO_PATH = path.join(__dirname, "../grpc/user.proto");
const TASK_PROTO_PATH = path.join(__dirname, "../grpc/task.proto");

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
const userProto = grpc.loadPackageDefinition(packageUserDefinition).user;
const taskProto = grpc.loadPackageDefinition(packageTaskDefinition).task;

const userClient = new userProto.UserService(
  process.env.USER_GRPC_PORT,
  grpc.credentials.createInsecure()
);
const taskClient = new taskProto.TaskService(
  process.env.TASK_GRPC_PORT,
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
module.exports = { getUser, getTask };
