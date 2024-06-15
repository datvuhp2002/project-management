"use strict";

const prisma = require("../prisma");
const RoleService = require("./role.service");
const { sendEmailToken } = require("./email.service");
const bcrypt = require("bcrypt");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
} = require("../core/error.response");
const cloudinary = require("../configs/cloudinary.config");
const { runProducer } = require("../message_queue/producer");
const { departmentProducerTopic } = require("../configs/kafkaDepartmentTopic");
const { GetAllUserFromProject } = require("./grpcClient.services");
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
    deletedMark: true,
    department_id: true,
    role: {
      select: {
        role_id: true,
        name: true,
      },
    },
  };
  // create new user
  static create = async (
    { username, email, password, role, ...rest },
    createdBy
  ) => {
    if (!role) throw new BadRequestError("Role is not defined");
    const role_data = await RoleService.findByName(role);
    if (!role) throw new BadRequestError("Role is not defined");
    if (!email) {
      throw new BadRequestError("Error: Email is not defined");
    }
    const holderUser = await prisma.user.findFirst({ where: { email } });
    if (holderUser) {
      throw new BadRequestError("Error: User Already registered");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        role_id: role_data.role_id,
        password: passwordHash,
        createdBy,
        ...rest,
      },
      select: this.select,
    });
    if (!newUser) throw new BadRequestError("Error: Cannot create new user");
    return newUser;
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
    const users = await prisma.user.findMany({
      where: { role_id: role_data.role_id },
    });
    return users.map((user) => user.user_id);
  };
  // find user by email
  static findByEmail = async (email) => {
    return await prisma.user.findFirst({
      where: { email },
      include: {
        role: {
          select: {
            role_id: true, // Assuming 'id' is a valid field
            name: true,
          },
        },
      },
    });
  };

  // add user into department
  static addUserIntoDepartment = async ({ list_user_ids }, department_id) => {
    return await prisma.user.updateMany({
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
    return await prisma.user.updateMany({
      where: {
        department_id,
        OR: list_user_ids.map((user_id) => ({ user_id: user_id })),
      },
      data: {
        department_id: null,
      },
    });
  };
  static removeStaffFromDepartmentHasBeenDeleted = async ({
    department_id,
  }) => {
    return await prisma.user.updateMany({
      where: {
        department_id,
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
    let listUser;
    if (manager_id !== userId)
      throw new AuthFailureError(
        "Đây không phải phòng ban bạn của bạn, vui lòng rời đi."
      );
    if (role) {
      const role_data = await RoleService.findByName(role);
      listUser = await prisma.user.findMany({
        where: { department_id, role_id: role_data.role_id },
      });
    } else {
      listUser = await prisma.user.findMany({
        where: { department_id },
      });
    }
    query.push({
      user_id: {
        in: listUser.map((user) => user.user_id),
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
  static getAllStaffInProject = async (query, project_id) => {
    const user_ids = await GetAllUserFromProject(project_id);
    return await this.getAllStaffByUserIds(query, { user_ids });
  };
  // get All Staff in department for ADMIN
  static getAllStaffInDepartmentForAdmin = async (
    { items_per_page, page, search, nextPage, previousPage, role = null },
    department_id
  ) => {
    let query = [];
    let ListUser;
    if (role) {
      const role_data = await RoleService.findByName(role);
      ListUser = await prisma.user.findMany({
        where: { department_id, role_id: role_data.role_id },
      });
    } else {
      ListUser = await prisma.user.findMany({
        where: { department_id },
      });
    }
    query.push({
      user_id: {
        in: ListUser.map((user) => user.user_id),
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
  static getAllStaffByUserIds = async (
    { items_per_page, page, search, nextPage, previousPage, role = null },
    { user_ids }
  ) => {
    let query = [];
    if (role) {
      const listUserByRole = await this.findUserByRole(role);
      const commonElements = listUserByRole.filter((element) =>
        user_ids.includes(element)
      );
      query.push({
        user_id: {
          in: commonElements,
        },
      });
    } else {
      query.push({
        user_id: {
          in: user_ids,
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
    haveDepartment,
    search,
    nextPage,
    previousPage,
    role,
  }) => {
    let query = [];
    if (haveDepartment && haveDepartment == "false") {
      query.push({
        OR: [
          {
            department_id: null,
          },
          {
            department_id: undefined,
          },
        ],
        deletedMark: false,
      });
    } else if (haveDepartment && haveDepartment == "true") {
      query.push({
        OR: [
          {
            department_id: { not: null },
          },
          {
            department_id: { not: undefined },
          },
        ],
        deletedMark: false,
      });
    }
    if (role) {
      console.log(role);
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
  static getListOfStaffDoNotHaveDepartment = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
    role = "STAFF",
  }) => {
    let query = [];
    query.push({
      user_id: {
        in: await this.findUserByRole(role),
      },
    });
    query.push({
      department_id: null || undefined,
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
  static getDetailManagerAndTotalStaffInDepartment = async ({
    department_id,
    manager_id,
  }) => {
    let managerInformation;
    const totalStaffInDePartment = await this.getAllStaffInDepartment(
      { items_per_page: "ALL" },
      { department_id }
    );
    if (manager_id) {
      managerInformation = await this.detailManager(manager_id);
      if (managerInformation) {
        if (managerInformation.avatar) {
          managerInformation.avatar = await this.getAvatar(
            managerInformation.avatar
          );
        }
      }
    } else {
      managerInformation = null;
    }
    return {
      total_staff: totalStaffInDePartment.total,
      manager: managerInformation,
    };
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
    if (id === null || id === undefined) return null;
    const detailUser = await prisma.user.findUnique({
      where: { user_id: id },
      select: this.select,
    });
    if (!detailUser) throw new NotFoundError("User not found");
    return detailUser;
  };
  static detailManager = async (id) => {
    if (id === null || id === undefined) return null;
    const detailUser = await prisma.user.findUnique({
      where: { user_id: id, deletedMark: false },
      select: this.select,
    });
    return detailUser;
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
    const { role, ...updateUserData } = data;
    if (role) {
      const role_data = await RoleService.findByName(role);
      if (!role_data) throw new BadRequestError("Role not found");
      updateUserData.role_id = role_data.role_id;
    }
    const updateUser = await prisma.user.update({
      where: { user_id: id },
      data: updateUserData,
      select: this.select,
    });
    if (updateUser) return true;
    throw new BadRequestError("Cập nhật không thành công, vui lòng thử lại");
  };
  // delete user account
  static delete = async (user_id) => {
    const deleteUser = await prisma.user.update({
      where: { user_id },
      select: this.select,
      data: {
        department_id: null,
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
    if (deleteUser) {
      const roleUser = await RoleService.findById(deleteUser);
      if (roleUser.name === "ADMIN" || roleUser.name === "MANAGER") {
        await runProducer(
          departmentProducerTopic.deleteUser,
          deleteUser.department_id
        );
        return true;
      }
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
      return restoreUser;
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
    await prisma.user.update({ where: { user_id }, data: { avatar: null } });
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
