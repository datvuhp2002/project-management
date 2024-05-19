"use strict";

const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { ObjectId } = require("mongodb");
const { getUserByUserPropertyIds } = require("../utils");
class AssignmentService {
  static select = {
    assignment_id: true,
    user_property_id: true,
    project_property_id: true,
    task_property_id: true,
    startAt: true,
    endAt: true,
    status: true,
    createdBy: true,
    createdAt: true,
  };
  // create new assignment
  static create = async (data, createdBy) => {
    const assignment = await prisma.assignment.create({
      data: { ...data, createdBy },
      select: this.select,
    });
    if (assignment) return assignment;
    return {
      code: 200,
      metadata: null,
    };
  };
  // get all assignment instances
  static getAll = async ({ items_per_page, page, nextPage, previousPage }) => {
    return await this.queryAssignment({
      condition: false,
      items_per_page,
      page,
      nextPage,
      previousPage,
    });
  };
  // remove staff from project
  static removeStaffFromProject = async (
    project_property_id,
    user_property_ids
  ) => {
    const removeStaff = await prisma.assignment.deleteMany({
      where: {
        project_property_id,
        user_property_id: { in: user_property_ids },
      },
    });
    if (removeStaff.count > 0) return true;
    return false;
  };

  // get all assignment instances
  static getAllUserPropertyFromProject = async (project_property_id) => {
    const listOfAssignment = await this.listOfAssignmentFromProject(
      project_property_id
    );
    if (listOfAssignment) {
      const userPropertyIds = listOfAssignment.assignments
        .map((assignment) => assignment.user_property_id)
        .filter((id) => id !== null);
      const uniqueUserPropertyIds = [...new Set(userPropertyIds)];
      return uniqueUserPropertyIds;
    }
    return null;
  };
  static getAllTaskPropertyFromProject = async (project_property_id) => {
    const listOfAssignment = await this.listOfAssignmentFromProject(
      project_property_id
    );
    console.log(listOfAssignment);
    if (listOfAssignment.assignments) {
      const taskPropertyIds = listOfAssignment.assignments
        .map((assignment) => assignment.task_property_id)
        .filter((id) => id !== null);
      const uniqueTaskPropertyIds = [...new Set(taskPropertyIds)];
      return uniqueTaskPropertyIds;
    }
    return null;
  };
  static listOfAssignmentFromProject = async (project_property_id) => {
    const query = [
      {
        deletedMark: false,
        project_property_id,
      },
    ];
    return await this.queryAssignment({
      query: query,
      items_per_page: "ALL",
    });
  };
  // get all assignment had been deleted
  static trash = async ({ items_per_page, page, nextPage, previousPage }) => {
    return await this.queryAssignment({
      condition: true,
      items_per_page,
      page,
      nextPage,
      previousPage,
    });
  };
  // assignment information
  static detail = async (id) => {
    return await prisma.assignment.findUnique({
      where: { assignment_id: id },
      select: this.select,
    });
  };
  // update assignment
  static update = async ({ id, data }) => {
    return await prisma.assignment.update({
      where: { assignment_id: id },
      data,
      select: this.select,
    });
  };
  // soft delete assignment
  static delete = async (assignment_id) => {
    return await prisma.assignment.update({
      where: { assignment_id },
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
      select: this.select,
    });
  };
  // restore assignment
  static restore = async (assignment_id) => {
    return await prisma.assignment.update({
      where: { assignment_id },
      data: {
        deletedMark: false,
      },
      select: this.select,
    });
  };
  static queryAssignment = async ({
    query,
    items_per_page,
    page,
    nextPage,
    previousPage,
  }) => {
    let whereClause = {};
    if (query && query.length > 0) {
      whereClause.AND = query;
    }
    const total = await prisma.assignment.count({
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
    const assignments = await prisma.assignment.findMany({
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
      assignments: assignments,
      total,
      nextPage: nextPageNumber,
      previousPage: previousPageNumber,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = AssignmentService;
