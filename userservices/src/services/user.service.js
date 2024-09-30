"use strict";
const prisma = require("../prisma");
const RoleService = require("./role.service");
// const { sendEmailToken } = require("../message_queue/producer.email");
const bcrypt = require("bcrypt");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const crypto = require("crypto");
const { runProducer } = require("../message_queue/producer");
const { departmentProducerTopic } = require("../configs/kafkaDepartmentTopic");
const { assignmentProducerTopic } = require("../configs/kafkaAssignmentTopic");
const {
  emailProducerTopic,
} = require("../configs/kafkaEmailTopic/producer/email.producer.topic.config");
const {
  notificationProducerTopic,
} = require("../configs/kafkaNotificationTopic/producer/notification.producer.topic.config");
const { genAvatarColor, removeAccents } = require("../utils");
const {
  GetAllUserFromProject,
  GetAvatar,
  GetDepartment,
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
  // create new user
  static create = async (
    { username, email, role, department_id, ...rest },
    createdBy
  ) => {
    if (!role) throw new BadRequestError("Role is not defined");
    const role_data = await RoleService.findByName(role);
    if (!role_data) throw new BadRequestError("Role is not defined");
    if (!role_data.name === "SUPER_ADMIN")
      throw new BadRequestError("Can't create this role");
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
    const avatarColor = genAvatarColor();

    // Chuyển username thành chữ thường và kiểm tra khoảng trắng
    username = removeAccents(username.toLowerCase());
    if (/\s/.test(username)) {
      throw new BadRequestError("Username should not contain spaces.");
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        avatar_color: avatarColor,
        role_id: role_data.role_id,
        password: passwordHash,
        department_id: department_id ? department_id : null,
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
    await runProducer(notificationProducerTopic.notiForCreateUser, {
      message_admin: `User ${newUser.username} is created`,
      message_user: `Welcome ${newUser.username} to the company.`,
      user_id: newUser.user_id,
      createdBy,
    });
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
    return await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: {
            role_id: true,
            name: true,
          },
        },
      },
    });
  };
  //find user by username
  static findByUsername = async (username) => {
    return await prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          select: {
            role_id: true,
            name: true,
          },
        },
      },
    });
  };
  // DEPARTMENT
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
    department_id,
    modifiedBy
  ) => {
    if (!department_id) {
      throw new BadRequestError("Invalid department");
    }
    const department = GetDepartment(department_id);
    const operations = list_user_ids.map(async (item) => {
      const user = await prisma.user.findUnique({
        where: { user_id: item },
        select: { username: true, role: { select: { name: true } } },
      });
      if (!user) {
        console.warn(`User with ID ${item} not found.`);
        return;
      }
      if (user.role.name === "MANAGER") {
        await runProducer(departmentProducerTopic.removeManager, department_id);
        await runProducer(notificationProducerTopic.notiForRemoveManager, {
          user_id,
          message: `Manager ${user.username} are removed from department`,
          modifiedBy,
          department_name: department.name,
          department_id,
        });
      }
      const removeStaff = await prisma.user.updateMany({
        where: {
          department_id,
          user_id: item,
        },
        data: {
          modifiedBy,
          department_id: null,
        },
      });
      if (removeStaff) {
        await runProducer(
          notificationProducerTopic.notiForRemoveStaffFromDepartment,
          {
            user_list: list_user_ids,
            message: `You are removed from department ${department.name}`,
            createdBy: modifiedBy,
          }
        );
      }
    });
    try {
      await Promise.all(operations);
    } catch (error) {
      throw new BadRequestError(
        `Failed to remove staff from department: ${error.message}`
      );
    }

    return true; // Hoặc giá trị phù hợp với yêu cầu của bạn
  };
  static removeStaffFromDepartmentHasBeenDeleted = async (
    department_id,
    modifiedBy
  ) => {
    return await prisma.user.updateMany({
      where: {
        department_id,
      },
      data: {
        department_id: null,
        modifiedBy,
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
  // Có thể gộp làm 1
  // {
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
  // get All Staff in departments for PM
  static getAllStaffInDepartments = async (
    { items_per_page, page, search, nextPage, previousPage, role = null },
    department_ids
  ) => {
    let query = [];
    let ListUser;
    if (role) {
      const role_data = await RoleService.findByName(role);
      ListUser = await prisma.user.findMany({
        where: {
          department_id: { in: department_ids },
          role_id: role_data.role_id,
        },
      });
    } else {
      ListUser = await prisma.user.findMany({
        where: { department_id: { in: department_ids } },
      });
    }
    query.push({
      user_id: {
        in: ListUser.map((user) => user.user_id),
      },
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
  // }
  static getListStaffIdsInDepartment = async (department_id) => {
    const userIds = await prisma.user.findMany({
      where: { department_id },
      select: { user_id: true },
    });
    // Sử dụng map để chỉ trả về mảng các user_id
    return userIds.map((user) => user.user_id);
  };
  static getListAllAdministrators = async () => {
    const adminIds = [
      ...(await this.findUserByRole("ADMIN")),
      ...(await this.findUserByRole("SUPER_ADMIN")),
    ];
    return [...new Set(adminIds)];
  };
  //
  // do not have department
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
      deletedMark: false,
      OR: [
        {
          department_id: null,
        },
        {
          department_id: undefined,
        },
      ],
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
  // get all staffs
  static getAll = async ({
    items_per_page,
    page,
    haveDepartment,
    department_id,
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
    // If department_id is provided, prioritize filtering by it
    if (department_id) {
      if (role) {
        // Filter by both department_id and role
        const roleData = await RoleService.findByName(role);
        query.push({
          department_id,
          role_id: roleData.role_id,
        });
      } else {
        // Filter only by department_id
        query.push({ department_id });
      }
    } else if (role) {
      const roleData = await RoleService.findByName(role);
      const usersByRole = await prisma.user.findMany({
        where: { role_id: roleData.role_id },
        select: { user_id: true },
      });

      query.push({
        user_id: { in: usersByRole.map((user) => user.user_id) },
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
  //////////
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
          try {
            managerInformation.avatar = await GetAvatar(
              managerInformation.avatar
            );
          } catch (e) {
            console.log("Upload services maybe close:::", e);
          }
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
  static getAllStaffInProject = async (query, project_id) => {
    try {
      const user_ids = await GetAllUserFromProject(project_id);
      return await this.getAllStaffByUserIds(query, { user_ids });
    } catch (e) {
      console.log("Assignment service maybe close:::", e);
    }
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
      try {
        const avatar = await GetAvatar(detailUser.avatar);
        detailUser.avatar = avatar;
      } catch (e) {
        console.log("Upload services maybe close:::", e);
      }
    }
    if (detailUser.department_id) {
      try {
        const department_info = await GetDepartment(detailUser.department_id);
        detailUser.department_info = department_info;
      } catch (e) {
        console.log("Upload services maybe close:::", e);
      }
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
  static update = async ({ id, data }, modifiedBy) => {
    data.modifiedBy = modifiedBy;
    const findUpdatedUser = await prisma.user.findUnique({
      where: { user_id: id },
      select: this.select,
    });
    if (id !== modifiedBy) {
      const findUserToUpdate = await prisma.user.findUnique({
        where: { user_id: modifiedBy },
        select: this.select,
      });
      if (findUpdatedUser.role.name === "SUPER_ADMIN")
        throw new BadRequestError("Can't update this account");
      if (
        findUserToUpdate.role.name !== "SUPER_ADMIN" &&
        findUpdatedUser.role.name === "ADMIN"
      ) {
        throw new BadRequestError("Can't update ADMIN ACCOUNT");
      }
    }
    if (data.username) {
      // Chuyển username thành chữ thường và kiểm tra khoảng trắng
      data.username = removeAccents(data.username.toLowerCase());
      if (/\s/.test(data.username)) {
        throw new BadRequestException("Username should not contain spaces.");
      }
    }
    if (data.avatar) {
      try {
        const updatedUser = await prisma.user.update({
          where: { user_id: id },
          data,
        });
        return updatedUser;
      } catch (err) {
        throw new BadRequestError("Update failed");
      }
    }
    const { role, ...updateUserData } = data;
    if (role) {
      const role_data = await RoleService.findByName(role);
      if (!role_data) throw new BadRequestError("Role not found");
      if (
        findUpdatedUser.role.name === "MANAGER" &&
        findUpdatedUser.role.name !== role &&
        findUpdatedUser.department_id !== null
      ) {
        await runProducer(
          departmentProducerTopic.removeManager,
          findUpdatedUser.department_id
        );
        const department = GetDepartment(findUpdatedUser.department_id);
        await runProducer(notificationProducerTopic.notiForRemoveManager, {
          user_id: id,
          message: `Manager ${findUpdatedUser.username} are removed from department`,
          modifiedBy,
          department_name: department.name,
          department_id: findUpdatedUser.department_id,
        });
        await this.updateWithoutModified({ id, data: { department_id: null } });
      }
      updateUserData.role_id = role_data.role_id;
    }
    const updatedUser = await prisma.user.update({
      where: { user_id: id },
      data: updateUserData,
      select: this.select,
    });
    if (updatedUser) {
      await runProducer(notificationProducerTopic.notiForUpdateUser, {
        message: `Your Account is updated`,
        user_id: id,
        modifiedBy,
      });
      return updatedUser;
    }
    throw new BadRequestError("Update failed");
  };
  //update user information [for consumer]
  static updateWithoutModified = async ({ id, data }) => {
    try {
      const { role, ...updateUserData } = data;
      if (role) {
        const role_data = await RoleService.findByName(role);
        if (!role_data) throw new BadRequestError("Role not found");
        updateUserData.role_id = role_data.role_id;
      }
      return await prisma.user.update({
        where: { user_id: id },
        data: updateUserData,
      });
    } catch (err) {
      throw new BadRequestError(err);
    }
  };
  // delete user account
  static delete = async (user_id, modifiedBy) => {
    const deleteUser = await prisma.user.update({
      where: { user_id },
      select: this.select,
      data: {
        department_id: null,
        deletedMark: true,
        modifiedBy,
        deletedAt: new Date(),
      },
    });
    if (!deleteUser) {
      throw new BadRequestError("User not found or update failed");
    }
    const roleUser = deleteUser.role.name;

    if (roleUser === "SUPER_ADMIN") {
      await this.restore(user_id);
      throw new BadRequestError("Can't delete this account");
    }
    if (roleUser === "ADMIN" || roleUser === "MANAGER") {
      if (deleteUser.department_id) {
        await runProducer(
          departmentProducerTopic.deleteUser,
          deleteUser.department_id
        );
        const department = GetDepartment(deleteUser.department_id);
        await runProducer(notificationProducerTopic.notiForRemoveManager, {
          user_id,
          message: `Manager ${deleteUser.username} are removed from department`,
          modifiedBy,
          department_name: department.name,
          department_id: deleteUser.department_id,
        });
      }
      await runProducer();
      return true;
    }
    return true;
  };
  static forceDelete = async (user_id, modifiedBy) => {
    const findDeletedUser = await prisma.user.findUnique({
      where: { user_id },
      select: this.select,
    });
    if (!findDeletedUser) {
      throw new NotFoundError("User not found");
    }
    if (findDeletedUser.role.name === "SUPER_ADMIN") {
      throw new BadRequestError("Can't force delete this account");
    }
    if (
      findDeletedUser.role.name === "ADMIN" ||
      findDeletedUser.role.name === "MANAGER"
    ) {
      if (findDeletedUser.department_id) {
        await runProducer(
          departmentProducerTopic.deleteUser,
          findDeletedUser.department_id
        );
        const department = GetDepartment(findDeletedUser.department_id);
        await runProducer(notificationProducerTopic.notiForRemoveManager, {
          user_id,
          message: `Manager ${findDeletedUser.username} are removed from department`,
          modifiedBy,
          department_name: department.name,
          department_id: findDeletedUser.department_id,
        });
      }
      await runProducer();
      return true;
    }
    const forceDeleteUser = await prisma.user.delete({ where: { user_id } });
    if (!forceDeleteUser) throw new BadRequestError("Delete user failed");
    await runProducer(assignmentProducerTopic.deletedUser, user_id);
    return true;
  };
  // restore user account
  static restore = async (user_id, modifiedBy) => {
    const restoreUser = await prisma.user.update({
      where: { user_id },
      select: this.select,
      data: {
        deletedMark: false,
        modifiedBy,
      },
    });
    if (restoreUser) {
      return restoreUser;
    }
    await this.delete(user_id, modifiedBy);
    return null;
  };
  // get list user do not have project
  static getListUserDoNotInProject = async (
    query,
    { project_id, department_id }
  ) => {
    try {
      const listUserInProjectsIds = await GetAllUserFromProject(project_id);
      const listAllStaffInDepartmentWithoutProjects =
        await prisma.user.findMany({
          where: {
            department_id: department_id,
            user_id: {
              notIn: listUserInProjectsIds,
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
      return await this.getAllStaffByUserIds(query, {
        user_ids: listAllStaffInDepartmentWithoutProjectsIds,
      });
    } catch (e) {
      console.log("Assignment service maybe close:::", e);
    }
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
    await Promise.all(
      users.map(async (user) => {
        try {
          const avatar = await GetAvatar(user.avatar);
          user.avatar = avatar;
        } catch (e) {
          console.log("Error fetching avatar:", e);
          user.avatar = null; // Set avatar to null in case of an error
        }

        try {
          const department_info = await GetDepartment(user.department_id);
          user.department_info = department_info;
        } catch (e) {
          console.log("Error fetching department name:", e);
          user.department_info = null; // Set department_name to null in case of an error
        }
      })
    );

    const lastPage = Math.ceil(total / itemsPerPage);
    return {
      users,
      total,
      nextPage: currentPage + 1 > lastPage ? null : currentPage + 1,
      previousPage: currentPage - 1 < 1 ? null : currentPage - 1,
      lastPage,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = UserService;
