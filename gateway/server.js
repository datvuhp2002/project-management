const app = require("./src/app");
const port = process.env.PORT || 3050;
const hostname = "0.0.0.0";

const server = app.listen(port, hostname, () => {
  console.log(`Hello at`, port);
});
