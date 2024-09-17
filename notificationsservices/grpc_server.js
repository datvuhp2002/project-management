"use strict";
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const NOTIFICATION_PROTO_PATH = path.join(
  __dirname,
  "src/grpc/notifications.proto"
);

const packageDefinition = protoLoader.loadSync(NOTIFICATION_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationProto = grpc.loadPackageDefinition(packageDefinition);

function startGrpcServer() {
  const server = new grpc.Server();
  server.addService(
    notificationProto.notification.NotificationService.service,
    {}
  );
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
