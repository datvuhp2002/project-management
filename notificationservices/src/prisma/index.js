const { PrismaClient } = require("@prisma/client");
const { readReplicas } = require("@prisma/extension-read-replicas");

const prisma = new PrismaClient().$extends(
  readReplicas({
    url: process.env.DATABASE_URL,
  })
);

module.exports = prisma;
