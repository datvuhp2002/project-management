"use strict";

const mongoose = require("mongoose");
const _SECOND = 5000;
const os = require("os");
const process = require("process");
// count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connections: ${numConnection}`);
};
// check overload connect
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    // Example maximum number of connections base on number of cores
    const maxConnection = numCores * 5;

    console.log(`Active connection: ${numConnection}`);

    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);
    if (numConnection > maxConnection) {
      console.log("Connection overload detected");
    }
  }, _SECOND); //Monitor every 5 seconds;
};
module.exports = {
  countConnect,
  checkOverload,
};
