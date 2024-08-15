"use strict";
const prisma = require("../prisma");
const RoleService = require("./role.service");
// const { sendEmailToken } = require("../message_queue/producer.email");
const bcrypt = require("bcrypt");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
} = require("../core/error.response");
const crypto = require("crypto");
const cloudinary = require("../configs/cloudinary.config");
const { runProducer } = require("../message_queue/producer");
const { departmentProducerTopic } = require("../configs/kafkaDepartmentTopic");
const { assignmentProducerTopic } = require("../configs/kafkaAssignmentTopic");
const {
  emailProducerTopic,
} = require("../configs/kafkaEmailTopic/producer/email.producer.topic.config");
const {
  uploadProducerTopic,
} = require("../configs/kafkaUploadTopic/producer/upload.producer.topic.config");

const {
  GetAllUserFromProject,
  GetAvatar,
  GetAllUserInDepartmentHaveProjects,
} = require("./grpcClient.services");
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
    avatar_color: true,
    role: {
      select: {
        role_id: true,
        name: true,
      },
    },
  };
  static genAvatarColor = () => {
    const result = Math.floor(Math.random() * 3);
    switch (result) {
      case 0:
        return "#f56a00";
      case 1:
        return "#87d068";
      case 2:
        return "#1677ff";
    }
  };
  // create new user
  static create = async ({ username, email, role, ...rest }, createdBy) => {
    if (!role) throw new BadRequestError("Role is not defined");
    const role_data = await RoleService.findByName(role);
    if (!role) throw new BadRequestError("Role is not defined");
    if (!email) {
      throw new BadRequestError("Email is not defined");
    }
    const holderUser = await prisma.user.findFirst({ where: { email } });
    if (holderUser) {
      throw new BadRequestError("User Already registered");
    }
    const randomBytes = crypto.randomBytes(3);
    // Convert the bytes to an integer
    const genPass = randomBytes.readUIntBE(0, 3) % 1000000;
    // Convert the integer to a string and pad it with leading zeros if necessary
    const password = genPass.toString().padStart(6, "0");
    const passwordHash = await bcrypt.hash(password, 10);
    const avatarColor = this.genAvatarColor();
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        avatar_color: avatarColor,
        role_id: role_data.role_id,
        password: passwordHash,
        createdBy,
        ...rest,
      },
      select: this.select,
    });
    if (!newUser) throw new BadRequestError("Cannot create new user");
    const message = {
      username: newUser.username,
      email: newUser.email,
      password: password,
    };
    await runProducer(emailProducerTopic.createUser, message);
    return newUser;
  };

  static async forgetPassword({ email = null, captcha = null }) {
    const holderUser = await prisma.user.findFirst({ where: { email } });
    // return holderUser;
    if (!holderUser) {
      throw new NotFoundError("User not found");
    }
    await runProducer(emailProducerTopic.sendEmailToken, holderUser.email);
    return true;
  }

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
    userId
  ) => {
    let query = [];
    let listUser;
    const userDepartment = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        department_id: true,
      },
    });
    if (
      userDepartment.department_id == null ||
      userDepartment.department_id == undefined
    ) {
      throw new BadRequestError("Bạn chưa có phòng ban!");
    }
    if (role) {
      const role_data = await RoleService.findByName(role);
      listUser = await prisma.user.findMany({
        where: {
          department_id: userDepartment.department_id,
          role_id: role_data.role_id,
        },
      });
    } else {
      listUser = await prisma.user.findMany({
        where: { department_id: userDepartment.department_id },
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
    const userIds = await this.findUserByRole(role);
    query.push({
      user_id: { in: userIds },
      department_id: null,
      deletedMark: false,
    });
    return await this.queryUser({
      query,
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
    const totalStaffInDePartment = await this.getAllStaffInDepartmentForAdmin(
      { items_per_page: "ALL" },
      department_id
    );
    if (manager_id) {
      managerInformation = await this.detailManager(manager_id);
      if (managerInformation) {
        if (managerInformation.avatar) {
          managerInformation.avatar = await GetAvatar(
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
    if (detailUser.avatar) {
      const avatar = await GetAvatar(detailUser.avatar);
      detailUser.avatar = avatar;
    }
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
  //update user information
  static update = async ({ id, data }) => {
    if (data.avatar) {
      try {
        const updatedUser = await prisma.user.update({
          where: { user_id: id },
          data,
        });
        return updatedUser;
      } catch (err) {
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
    const updatedUser = await prisma.user.update({
      where: { user_id: id },
      data: updateUserData,
      select: this.select,
    });
    if (updatedUser) return updatedUser;
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
  // get list user do not have project
  static getListUserDoNotHaveProject = async (query, department_id) => {
    const listUserInDepartmentHaveProjectsIds =
      await GetAllUserInDepartmentHaveProjects(department_id);
    const listAllStaffInDepartmentWithoutProjects = await prisma.user.findMany({
      where: {
        department_id: department_id,
        user_id: {
          notIn: listUserInDepartmentHaveProjectsIds,
        },
      },
      select: {
        user_id: true,
      },
    });
    const listAllStaffInDepartmentWithoutProjectsIds =
      listAllStaffInDepartmentWithoutProjects.map((id) => {
        return id.user_id;
      });

    return await this.getAllStaffByUserIds(
      query,
      listAllStaffInDepartmentWithoutProjectsIds
    );
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
      AND: [
        {
          OR: [
            { username: { contains: searchKeyword } },
            { email: { contains: searchKeyword } },
          ],
        },
      ],
    };
    if (query && query.length > 0) {
      whereClause.AND.push(...query);
    }
    const total = await prisma.user.count({
      where: whereClause,
    });

    const itemsPerPage =
      items_per_page === "ALL" ? total : Number(items_per_page) || 10;
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * itemsPerPage;
    const users = await prisma.user.findMany({
      take: itemsPerPage,
      skip,
      select: this.select,
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const getUsersAvatar = users.map(async (user) => {
      if (user.avatar) {
        const avatar = await GetAvatar(user.avatar);
        user.avatar = avatar;
      }
    });

    await Promise.all(getUsersAvatar);

    const lastPage = Math.ceil(total / itemsPerPage);
    return {
      users,
      total,
      nextPage: currentPage + 1 > lastPage ? null : currentPage + 1,
      previousPage: currentPage - 1 < 1 ? null : currentPage - 1,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = UserService;
