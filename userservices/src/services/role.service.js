"use strict";
const prisma = require("../prisma");
class RoleService {
  static create = async ({ name }) => {
    const role = await prisma.role.create({ data: { name } });
    return role;
  };
  static getAll = async () => {
    return prisma.role.findMany();
  };
  static findByName = async (name) => {
    return await prisma.role.findFirst({ where: { name } });
  };
  static findById = async ({ id }) => {
    return await prisma.role.findFirst({ where: { role_id: id } });
  };
}
module.exports = RoleService;
