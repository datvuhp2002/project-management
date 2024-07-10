const app = require("./src/app");
const port = process.env.PORT || 3056;
const hostname = "0.0.0.0";
const startGrpcServer = require("./grpc_server");

async function main() {}
const server = app.listen(port, hostname, () => {
  console.log(`Hello at`, port);
  main()
    .then(async () => {
      startGrpcServer();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
});
