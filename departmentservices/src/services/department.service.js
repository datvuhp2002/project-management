"use strict";

const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { runProducer } = require("../message_queue/producer");
const { userProducerTopic } = require("../configs/kafkaUserTopic");
const {
  getUser,
  GetDetailManagerAndTotalStaffInDepartment,
} = require("./grpcClient.services");
const { projectProducerTopic } = require("../configs/kafkaProjectTopic");
const {
  notificationProducerTopic,
} = require("../configs/kafkaNotificationTopic");
class DepartmentService {
  static select = {
    department_id: true,
    name: true,
    description: true,
    createdBy: true,
    createdAt: true,
    updatedAt: true,
    manager_id: true,
  };
  // create new department
  static create = async (
    { name, description, manager_id = null, list_user_ids },
    createdBy
  ) => {
    const department = await prisma.department.create({
      data: { name, description, createdBy, manager_id },
      select: this.select,
    });
    if (department) {
      if (manager_id !== null) {
        await runProducer(userProducerTopic.selectManagerToDepartment, {
          old_manager_id: null,
          id: manager_id,
          data: {
            department_id: department.department_id,
            department_name: department.name,
            modifiedBy: createdBy,
          },
        });
        const department_for_delete_old_manager_id =
          await prisma.department.findFirst({
            where: {
              manager_id,
              department_id: { not: department.department_id },
            },
          });
        if (department_for_delete_old_manager_id) {
          await prisma.department.update({
            where: {
              department_id: department_for_delete_old_manager_id.department_id,
            },
            data: {
              manager_id: null,
            },
          });
        }
      }
      const listUserIds = list_user_ids ? [...new Set(list_user_ids)] : [];
      if (list_user_ids) {
        await runProducer(userProducerTopic.addStaffIntoDepartment, {
          list_user_ids: listUserIds,
          department_id: department.department_id,
          department_name: department.name,
          createdBy,
        });
      }
      await runProducer(notificationProducerTopic.notiForCreateDepartment, {
        message_admin: `department is created`,
        message_user: `You have been added to department`,
        list_user_ids: listUserIds,
        createdBy,
        target_id: department.department_id,
        target_name: department.name,
        targetFor: "DEPARTMENT",
      });
      return department;
    }
    throw new BadRequestError("Department create failed");
  };
  // get all department instances
  static getAll = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    const query = [
      {
        deletedMark: false,
      },
    ];
    return await this.queryDepartment(
      {
        query: query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      true
    );
  };
  // get all department had been deleted
  static trash = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    const query = [
      {
        deletedMark: true,
      },
    ];
    return await this.queryDepartment(
      {
        query: query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      false
    );
  };
  static infoDepartment = async (id) => {
    const department = await prisma.department.findUnique({
      where: { department_id: id },
      select: this.select,
    });
    if (!department) {
      throw new BadRequestError("Department not found");
    }
    return department;
  };
  // department information
  static detail = async (id) => {
    const department = await prisma.department.findUnique({
      where: { department_id: id },
      select: this.select,
    });
    if (!department) {
      throw new BadRequestError("Department not found");
    }
    if (department.manager_id) {
      try {
        const userResponse = await GetDetailManagerAndTotalStaffInDepartment(
          department.department_id,
          department.manager_id
        );
        department.information = userResponse;
      } catch (err) {
        console.log(err);
      }
    }
    return department;
  };
  // update department for manager
  static updateForManager = async ({ id, data, userId }) => {
    const department = await prisma.department.findUnique({
      where: { department_id: id },
    });
    if (!department) throw new BadRequestError("Department not found");
    if (department.manager_id !== userId)
      throw new BadRequestError("Bạn không có quyền cập nhật cho phòng ban");
    if (data.manager_id)
      throw new BadRequestError(
        "Bạn không có quyền chỉ định quản lý cho phòng ban"
      );
    return await prisma.department.update({
      where: { department_id: id },
      data: { ...data, modifiedBy: userId },
      select: this.select,
    });
  };
  static update = async ({ id, data, userId }) => {
    const department = await prisma.department.findUnique({
      where: { department_id: id },
    });
    if (!department) {
      throw new Error("Department not found");
    }
    // Nếu `manager_id` được cập nhật
    if (data.manager_id) {
      // Gọi producer để cập nhật manager
      await runProducer(userProducerTopic.selectManagerToDepartment, {
        old_manager_id: department.manager_id,
        id: data.manager_id,
        data: {
          department_id: id,
          department_name: department.name,
          modifiedBy: userId,
        },
      });
      const department_data_old = await prisma.department.findFirst({
        where: { manager_id: data.manager_id },
      });
      if (department_data_old) {
        await prisma.department.update({
          where: {
            department_id: department_data_old.department_id,
          },
          data: { manager_id: null, modifiedBy: userId },
        });
      }
    }
    const result = await prisma.department.update({
      where: { department_id: id },
      data: { ...data, modifiedBy: userId },
      select: this.select,
    });
    if (result) {
      await runProducer(notificationProducerTopic.notiForUpdateDepartment, {
        message: `department is updated`,
        modifiedBy: userId,
        department_id: result.department_id,
        department_name: result.name,
        targetFor: "DEPARTMENT",
      });
      return result;
    }
    // Trả về true nếu cập nhật thành công, false nếu không
    throw new BadRequestError("Department update failed");
  };
  static deleteManagerId = async (department_id) => {
    const deleteManagerId = await prisma.department.update({
      where: { department_id },
      data: { manager_id: null },
    });
    if (deleteManagerId) {
      return true;
    }
    return false;
  };
  // delete department
  static delete = async (department_id, modifiedBy) => {
    const get_department = await prisma.department.findUnique({
      where: {
        department_id,
      },
    });
    const delete_department = await prisma.department.update({
      where: { department_id },
      data: {
        manager_id: null,
        deletedMark: true,
        deletedAt: new Date(),
      },
      select: this.select,
    });
    if (!delete_department) {
      await this.restore(department_id, modifiedBy);
      throw new BadRequestError("Xóa phòng ban không thành công");
    } else {
      await runProducer(notificationProducerTopic.notiFordeleteDepartment, {
        message: `department is deleted`,
        modifiedBy,
        department_id,
        department_name: get_department.name,
        targetFor: "DEPARTMENT",
      });
      await runProducer(projectProducerTopic.removeProjectFromDepartment, {
        department_id,
        department_name: get_department.name,
      });
      if (get_department.manager_id) {
        await runProducer(userProducerTopic.selectManagerToDepartment, {
          old_manager_id: get_department.manager_id,
          id: null,
          data: { department_name: get_department.name, modifiedBy },
        });
      }
      await runProducer(userProducerTopic.removeStaffOutOfDepartment, {
        department_id: department_id,
        department_name: get_department.name,
        modifiedBy,
      });
      return true;
    }
  };
  static forceDelete = async (department_id, modifiedBy) => {
    const department = await prisma.department.findUnique({
      where: { department_id },
    });
    const forceDeleteDepartment = await prisma.department.delete({
      where: { department_id },
    });
    if (!forceDeleteDepartment) {
      throw new BadRequestError("Xóa phòng ban không thành công");
    }
    await runProducer(
      projectProducerTopic.removeProjectFromDepartment,
      department_id
    );
    await runProducer(userProducerTopic.removeStaffOutOfDepartment, {
      department_id,
      department_name: department.name,
      createdBy: modifiedBy,
    });
    await runProducer(notificationProducerTopic.notiFordeleteDepartment, {
      message: `department is deleted`,
      modifiedBy,
      department_id,
      department_name: department.name,
      targetFor: "DEPARTMENT",
    });
    return true;
  };
  // restore department
  static restore = async (department_id, modifiedBy) => {
    const department = await prisma.department.findUnique({
      where: { department_id },
    });
    const restoreDepartment = await prisma.department.update({
      where: { department_id },
      data: {
        deletedMark: false,
      },
      select: this.select,
    });
    if (!restoreDepartment) {
      await this.delete(department_id, modifiedBy);
      throw new BadRequestError("Khôi phục phòng ban không thành công");
    }
    await runProducer(notificationProducerTopic.notiForRestoreDepartment, {
      message: `department is restored`,
      modifiedBy,
      department_id,
      department_name: department.name,
      targetFor: "DEPARTMENT",
    });
    return true;
  };
  static queryDepartment = async (
    { query, items_per_page, page, search, nextPage, previousPage },
    isNotTrash = true
  ) => {
    const searchKeyword = search || "";
    let itemsPerPage = 10;
    let whereClause = {
      OR: [
        {
          name: {
            contains: searchKeyword,
          },
        },
        {
          description: {
            contains: searchKeyword,
          },
        },
      ],
    };

    if (query && query.length > 0) {
      whereClause.AND = query;
    }
    const total = await prisma.department.count({
      where: whereClause,
    });

    if (items_per_page !== "ALL") {
      itemsPerPage = Number(items_per_page) || 10;
    } else {
      itemsPerPage = total;
    }

    const currentPage = Number(page) || 1;
    const skip = currentPage > 1 ? (currentPage - 1) * itemsPerPage : 0;
    const departments = await prisma.department.findMany({
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
    if (isNotTrash) {
      const departmentPromises = departments.map(async (department, index) => {
        try {
          const result = await GetDetailManagerAndTotalStaffInDepartment(
            department.department_id,
            department.manager_id
          );
          department.information = result;
        } catch (e) {
          console.log(e);
        }
      });
      await Promise.all(departmentPromises);
    }
    return {
      departments: departments,
      total,
      nextPage: nextPageNumber,
      previousPage: previousPageNumber,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = DepartmentService;
