"use strict";

const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { runProducer } = require("../message_queue/producer");
const { runConsumerOnDemand } = require("../message_queue/consumer.demand");
const { userProducerTopic } = require("../configs/kafkaUserTopic");
class DepartmentService {
  static select = {
    department_id: true,
    name: true,
    description: true,
    createdBy: true,
    createdAt: true,
    manager_id: true,
  };
  // create new department
  static create = async ({ name, description }, createdBy) => {
    const department = await prisma.department.create({
      data: { name, description, createdBy },
      select: this.select,
    });
    if (department) return department;
    return {
      code: 200,
      metadata: null,
    };
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
  // department information
  static detail = async (id) => {
    return await prisma.department.findUnique({
      where: { department_id: id },
      select: this.select,
    });
  };
  // update department for manager
  static updateForManager = async ({ id, data, userId }) => {
    const department = await prisma.department.findUnique({
      where: { department_id: id },
    });
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
    const updateDepartment = await prisma.department.update({
      where: { department_id: id },
      data: { ...data, modifiedBy: userId },
      select: this.select,
    });
    if (updateDepartment) {
      if (data.manager_id) {
        await runProducer(userProducerTopic.selectManagerToDepartment, {
          old_manager_id: department.manager_id,
          id: data.manager_id,
          data: { department_id: id },
        });
      }
      return true;
    }
    return false;
  };
  static deleteManagerId = async (department_id) => {
    console.log("Department_id:::", department_id);
    const deleteManagerId = await prisma.department.update({
      where: { department_id },
      data: { manager_id: null },
    });
    if (deleteManagerId) return true;
    return false;
  };
  // delete department
  static delete = async (department_id) => {
    return await prisma.department.update({
      where: { department_id },
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
      select: this.select,
    });
  };
  // restore department
  static restore = async (department_id) => {
    return await prisma.department.update({
      where: { department_id },
      data: {
        deletedMark: false,
      },
      select: this.select,
    });
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
      const department_list_id = departments.map((department) => ({
        department_id: department.department_id,
        manager_id: department.manager_id,
      }));

      await runProducer(
        userProducerTopic.getAllUserInDepartmentAndDetailManager,
        department_list_id
      );
      const userData = await runConsumerOnDemand();
      console.log("User DATA:::", userData);
      departments.map((item, index) => {
        item.information = userData[index];
      });
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
