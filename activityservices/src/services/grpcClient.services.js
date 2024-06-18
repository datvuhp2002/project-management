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

module.exports = { getUser };
