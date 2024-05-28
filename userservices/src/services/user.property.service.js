"use strict";
const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { select } = require("./user.service");
class UserPropertyService {
  static create = async ({ role_id, user_id, department_id }) => {
    const newUserProperty = await prisma.userProperty.create({
      data: {
        role_id,
        user_id,
        department_id,
      },
    });
    if (newUserProperty) {
      return {
        code: 201,
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
  static getAll = async () => {
    return await prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
  };
  static findUserByRole = async (role_id) => {
    const users_id = await prisma.userProperty.findMany({
      where: { role_id },
      select: { user_id: true, user_property_id: true },
    });
    return users_id;
  };
  static update = async (user_id, data) => {
    const updateUserProperty = await prisma.userProperty.update({
      where: { user_id },
      data,
    });
    if (!updateUserProperty)
      throw new BadRequestError("Đã sảy ra lỗi, vui lòng thử lại");
    return true;
  };
  static findUserByRoleAndDepartment = async (role_id) => {
    const users_id = await prisma.userProperty.findMany({
      where: { role_id },
      select: { user_id: true },
    });
    return users_id;
  };
  static delete = async (user_id) => {
    return await prisma.userProperty.update({
      where: { user_id },
      data: {
        department_id: null,
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
  };
  static restore = async (user_id) => {
    return await prisma.userProperty.update({
      where: { user_id },
      select: this.select,
      data: {
        deletedMark: false,
      },
    });
  };
}
module.exports = UserPropertyService;