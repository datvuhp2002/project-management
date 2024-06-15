"use strict";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const USER_PROTO_PATH = path.join(__dirname, "../grpc/user.proto");
const packageDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const userClient = new userProto.UserService(
  "0.0.0.0:50053",
  grpc.credentials.createInsecure()
);

async function getUser(user_id) {
  return new Promise((resolve, reject) => {
    userClient.getUser({ user_id }, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}
async function GetDetailManagerAndTotalStaffInDepartment(
  department_id,
  manager_id
) {
  console.log(department_id, manager_id);
  return new Promise((resolve, reject) => {
    userClient.GetDetailManagerAndTotalStaffInDepartment(
      { department_id, manager_id },
      (err, response) => {
        if (err) {
          console.error(
            "Error in GetDetailManagerAndTotalStaffInDepartment:",
            err
          ); // Thêm log
          reject(err);
        } else {
          console.log(response);
          resolve(response);
        }
      }
    );
  });
}
module.exports = { getUser, GetDetailManagerAndTotalStaffInDepartment };
