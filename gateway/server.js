const app = require("./src/app");
const port = process.env.PORT || 3050;
const server = app.listen(port, () => {
  console.log(`Hello at`, port);
});
