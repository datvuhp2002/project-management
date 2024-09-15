const app = require("./src/app");
const prisma = require("./src/prisma");
const port = process.env.PORT;
const hostname = "0.0.0.0";
const startGrpcServer = require("./grpc_server");

async function main() {}
const server = app.listen(port, hostname, () => {
  console.log(`Hello at`, port);
  startGrpcServer();
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
});
