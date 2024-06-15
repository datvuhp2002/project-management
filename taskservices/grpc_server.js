"use strict";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { GetTask } = require("./src/services/grpc.service");
const path = require("path");

const TASK_PROTO_PATH = path.join(__dirname, "src/grpc/task.proto");

const packageDefinition = protoLoader.loadSync(TASK_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const taskProto = grpc.loadPackageDefinition(packageDefinition);

function startGrpcServer() {
  const server = new grpc.Server();
  server.addService(taskProto.task.TaskService.service, {
    GetTask,
  });
  const host = "0.0.0.0";
  const port = process.env.GRPC_PORT;
  server.bindAsync(
    `${host}:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Error binding gRPC server:", err);
        return;
      }
      console.log("gRPC server running on port:", port);
    }
  );
}

module.exports = startGrpcServer;
