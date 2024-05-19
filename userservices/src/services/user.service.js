"use strict";

const { getInfoData } = require("../utils");
const prisma = require("../prisma");
const RoleService = require("./role.service");
const UserProperty = require("./user.property.service");
const UserPropertyService = require("./user.property.service");
const { sendEmailToken } = require("./email.service");
const bcrypt = require("bcrypt");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
} = require("../core/error.response");
const cloudinary = require("../configs/cloudinary.config");
class UserService {
  static select = {
    user_id: true,
    username: true,
    email: true,
    phone: true,
    avatar: true,
    name: true,
    birthday: true,
    createdAt: true,
    createdBy: true,
    UserProperty: true,
  };
  // create new user
  static create = async (
    { username, email, password, role_id, department_id },
    createdBy
  ) => {
    // check Email exists
    const holderUser = await prisma.user.findFirst({ where: { email } });
    if (holderUser) {
      throw new BadRequestError("Error: User Already registered");
    }
    // Tìm role id
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: passwordHash,
        createdBy,
      },
    });
    if (newUser) {
      const userProperty = await UserPropertyService.create({
        role_id,
        user_id: newUser.user_id,
        department_id,
      });
      if (userProperty) {
        return {
          code: 201,
        };
      } else {
        await this.prisma.user.delete({ where: { user_id: newUser.user_id } });
        return false;
      }
    }
    return {
      code: 200,
      data: null,
    };
  };
  static forgetPassword = async ({ email = null, captcha = null }) => {
    const holderUser = await prisma.user.findFirst({ where: { email } });
    if (!holderUser) {
      throw new NotFoundError("User not found");
    }
    // send mail
    const result = await sendEmailToken({ email });
    if (result) return true;
    throw new BadRequestError("Hệ thống lỗi, vui lòng thử lại");
  };
  static changePassword = async ({ password, email }) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const changePassword = await prisma.user.update({
      where: { email },
      data: { password: passwordHash },
    });
    if (changePassword) return true;
    throw new BadRequestError("Đã sảy ra lỗ i, vui lòng thử lại");
  };
  // find user by role
  static findUserByRole = async (role) => {
    const role_data = await RoleService.findByName(role);
    if (!role_data) throw new BadRequestError("Role không tồn tại");
    const users = await UserProperty.findUserByRole(role_data.role_id);
    return users.map((user) => user.user_id);
  };
  // find user property by role
  static findUserPropertyByRole = async (role) => {
    const role_data = await RoleService.findByName(role);
    if (!role_data) throw new BadRequestError("Role không tồn tại");
    const users = await UserProperty.findUserByRole(role_data.role_id);
    return users.map((user) => user.user_property_id);
  };
  // find user by email
  static findByEmail = async (email) => {
    return await prisma.user.findFirst({
      where: { email },
      include: { UserProperty: { include: { role: true } } },
    });
  };

  // add user into department
  static addUserIntoDepartment = async ({ list_user_ids }, department_id) => {
    return await prisma.userProperty.updateMany({
      where: {
        OR: list_user_ids.map((user_id) => ({ user_id: user_id })),
      },
      data: {
        department_id,
      },
    });
  };
  // remove user out of department
  static removeStaffFromDepartment = async (
    { list_user_ids },
    department_id
  ) => {
    return await prisma.userProperty.updateMany({
      where: {
        OR: list_user_ids.map((user_id) => ({ user_id: user_id })),
      },
      data: {
        department_id: null,
      },
    });
  };
  // get All Staff in department for Manager
  static getAllStaffInDepartment = async (
    { items_per_page, page, search, nextPage, previousPage, role = null },
    { department_id, manager_id },
    userId
  ) => {
    let query = [];
    let ListUserProperty;
    if (manager_id !== userId)
      throw new AuthFailureError(
        "Đây không phải phòng ban bạn của bạn, vui lòng rời đi."
      );
    if (role) {
      const role_data = await RoleService.findByName(role);
      ListUserProperty = await prisma.userProperty.findMany({
        where: { department_id, role_id: role_data.role_id },
      });
    } else {
      ListUserProperty = await prisma.userProperty.findMany({
        where: { department_id },
      });
    }
    query.push({
      user_id: {
        in: ListUserProperty.map((user) => user.user_id),
      },
    });
    query.push({
      deletedMark: false,
    });
    return await this.queryUser({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // get All Staff in department for ADMIN
  static getAllStaffInDepartmentForAdmin = async (
    { items_per_page, page, search, nextPage, previousPage, role = null },
    department_id
  ) => {
    let query = [];
    let ListUserProperty;
    if (role) {
      const role_data = await RoleService.findByName(role);
      ListUserProperty = await prisma.userProperty.findMany({
        where: { department_id, role_id: role_data.role_id },
      });
    } else {
      ListUserProperty = await prisma.userProperty.findMany({
        where: { department_id },
      });
    }
    query.push({
      user_id: {
        in: ListUserProperty.map((user) => user.user_id),
      },
    });
    query.push({
      deletedMark: false,
    });
    return await this.queryUser({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // get all staff by user properties
  static getAllStaffByUserProperty = async (
    { items_per_page, page, search, nextPage, previousPage, role = null },
    { user_property_ids }
  ) => {
    console.log(user_property_ids);
    let query = [];
    if (role) {
      const listUserPropertyByRole = await this.findUserPropertyByRole(role);
      const commonElements = listUserPropertyByRole.filter((element) =>
        user_property_ids.includes(element)
      );
      query.push({
        user_id: {
          in: commonElements,
        },
      });
    } else {
      query.push({
        UserProperty: {
          user_property_id: {
            in: user_property_ids,
          },
        },
      });
    }
    query.push({
      deletedMark: false,
    });
    return await this.queryUser({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // get all staffs
  static getAll = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
    role = null,
  }) => {
    let query = [];
    if (role) {
      query.push({
        user_id: {
          in: await this.findUserByRole(role),
        },
      });
    }
    query.push({
      deletedMark: false,
    });
    return await this.queryUser({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // get all staffs has been delete
  static trash = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
    role = null,
  }) => {
    let query = [];
    if (role) {
      query.push({
        user_id: {
          in: await this.findUserByRole(role),
        },
      });
    }
    query.push({
      deletedMark: true,
    });
    return await this.queryUser({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // staff information
  static detail = async (id) => {
    return await prisma.user.findUnique({
      where: { user_id: id },
      select: this.select,
    });
  };
  // user information
  static detailUser = async (id) => {
    return await prisma.user.findUnique({
      where: { user_id: id },
      select: this.select,
    });
  };
  // staff information for admin
  static information = async (id) => {
    return await prisma.user.findUnique({
      where: { user_id: id },
      select: this.select,
    });
  };
  // update user information
  static update = async ({ id, data }) => {
    if (data.avatar) {
      try {
        return await prisma.user.update({
          where: { user_id: id },
          data,
          select: this.select,
        });
      } catch (errr) {
        cloudinary.uploader.destroy(data.avatar);
        throw new BadRequestError(
          "Cập nhật không thành công, vui lòng thử lại."
        );
      }
    }
    return await prisma.user.update({
      where: { user_id: id },
      data,
      select: this.select,
    });
  };
  // delete user account
  static delete = async (user_id) => {
    const deleteUser = await prisma.user.update({
      where: { user_id },
      select: this.select,
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
    if (deleteUser) {
      const deleteUserProperty = await UserPropertyService.delete(user_id);
      if (deleteUserProperty) return true;
      await this.restore(user_id);
    }
    await this.restore(user_id);
    return null;
  };
  // restore user account
  static restore = async (user_id) => {
    const restoreUser = await prisma.user.update({
      where: { user_id },
      select: this.select,
      data: {
        deletedMark: false,
      },
    });
    if (restoreUser) {
      const restoreUserProperty = await UserPropertyService.restore(user_id);
      if (restoreUserProperty) return true;
      await this.delete(user_id);
    }
    await this.delete(user_id);
    return null;
  };
  // get avatar by public id
  static getAvatar = async (avatar) => {
    // Return colors in the response
    const options = {
      height: 100,
      width: 100,
      format: "jpg",
    };
    try {
      const result = await cloudinary.url(avatar, options);
      return result;
    } catch (error) {
      console.error(error);
    }
  };
  // delete avatar in cloud
  static deleteAvatarInCloud = async (avatar, user_id) => {
    // Return colors in the response
    prisma.user.update({ where: { user_id }, data: { avatar: null } });
    return await cloudinary.uploader.destroy(avatar);
  };
  static queryUser = async ({
    query,
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    const searchKeyword = search || "";
    let whereClause = {
      OR: [
        {
          username: {
            contains: searchKeyword,
          },
        },
        {
          email: {
            contains: searchKeyword,
          },
        },
      ],
    };
    if (query && query.length > 0) {
      whereClause.AND = query;
    }
    const total = await prisma.user.count({
      where: whereClause,
    });
    let itemsPerPage;
    if (items_per_page !== "ALL") {
      itemsPerPage = Number(items_per_page) || 10;
    } else {
      itemsPerPage = total;
    }
    const currentPage = Number(page) || 1;
    const skip = currentPage > 1 ? (currentPage - 1) * itemsPerPage : 0;
    const users = await prisma.user.findMany({
      take: itemsPerPage,
      skip,
      select: this.select,
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });
    const lastPage = Math.ceil(total / itemsPerPage);
    const nextPageNumber = currentPage + 1 > lastPage ? null : currentPage + 1;
    const previousPageNumber = currentPage - 1 < 1 ? null : currentPage - 1;
    return {
      users: users,
      total,
      nextPage: nextPageNumber,
      previousPage: previousPageNumber,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = UserService;
