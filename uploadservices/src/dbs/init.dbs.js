"use strict";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Database {
  constructor() {
    this.connect();
  }
  async connect() {
    try {
      await prisma.$connect();
      console.log("Connected to Prisma successfully");
    } catch (error) {
      console.error("Error connecting to Prisma:", error);
    }
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instancePrisma = Database.getInstance();
module.exports = instancePrisma;
