"use strict";

const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { getUser, getTask, getProject } = require("./grpcClient.services");
class AssignmentService {
  static select = {
    assignment_id: true,
    user_id: true,
    project_id: true,
    task_id: true,
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
  static getAll = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
    status,
  }) => {
    let query = [];
    query.push({ deletedMark: false });
    if (status && status === "true") {
      query.push({ status: true });
    } else if (status && status === "false") {
      query.push({ status: false });
    }
    return await this.queryAssignment(
      {
        query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      true
    );
  };
  static getAllAssignment = async (query, id) => {
    switch (query.target) {
      case "project":
        return await this.getAllAssignmentForProject(query, id);
        break;
      case "task":
        return await this.getAllAssignmentForTask(query, id);
        break;
      default:
        return await this.getAllAssignmentForUser(query, id);
        break;
    }
  };
  static getAllAssignmentForUser = async (
    { items_per_page, page, search, nextPage, previousPage, status },
    user_id
  ) => {
    let query = [];
    query.push({ deletedMark: false, user_id });
    if (status && status === "true") {
      query.push({ status: true });
    } else if (status && status === "false") {
      query.push({ status: false });
    }
    return await this.queryAssignment(
      {
        query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      true
    );
  };
  static getAllAssignmentForTask = async (
    {
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
      status,
      isAssigned,
    },
    task_id
  ) => {
    let query = [];
    query.push({ deletedMark: false, task_id });
    if (status && status === "true") {
      query.push({ status: true });
    } else if (status && status === "false") {
      query.push({ status: false });
    }
    if (isAssigned && isAssigned === "true") {
      query.push(
        {
          user_id: { not: null },
        },
        {
          user_id: { not: undefined },
        }
      );
    } else if (isAssigned && isAssigned === "false") {
      query.push(
        {
          user_id: null,
        },
        {
          user_id: undefined,
        }
      );
    }
    return await this.queryAssignment(
      {
        query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      true
    );
  };
  static getAllAssignmentForProject = async (
    {
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
      status,
      isAssigned,
    },
    project_id
  ) => {
    let query = [];
    query.push({ deletedMark: false, project_id });
    if (isAssigned && isAssigned === "true") {
      query.push(
        {
          user_id: { not: null },
        },
        {
          user_id: { not: undefined },
        }
      );
    } else if (isAssigned && isAssigned === "false") {
      query.push(
        {
          user_id: null,
        },
        {
          user_id: undefined,
        }
      );
    }
    if (status && status === "true") {
      query.push({ status: true });
    } else if (status && status === "false") {
      query.push({ status: false });
    }
    return await this.queryAssignment(
      {
        query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      true
    );
  };
  // remove staff from project
  static removeStaffFromProject = async (project_id, user_ids) => {
    const removeStaff = await prisma.assignment.deleteMany({
      where: {
        project_id,
        user_id: { in: user_ids },
      },
    });
    if (removeStaff.count > 0) return true;
    return false;
  };
  // get all assignment instances
  static getAllUserFromProject = async (project_id) => {
    const listOfAssignment = await this.listOfAssignmentFromProject(
      project_id,
      null
    );
    if (listOfAssignment) {
      const userIds = listOfAssignment.assignments
        .map((assignment) => assignment.user_id)
        .filter((id) => id !== null);
      const uniqueUserIds = [...new Set(userIds)];
      return uniqueUserIds;
    }
    return null;
  };
  // list of task from project
  static getAllTaskFromProject = async (project_id) => {
    const listOfAssignment = await this.listOfAssignmentFromProject(
      project_id,
      null
    );
    if (listOfAssignment.assignments) {
      const taskIds = listOfAssignment.assignments.map(
        (assignment) => assignment.task_id
      );
      const uniqueTaskIds = [...new Set(taskIds)];
      return uniqueTaskIds;
    }
    return null;
  };
  // list of task from project
  static listOfAssignmentFromProject = async (project_id, status) => {
    let query = [
      {
        deletedMark: false,
        project_id,
      },
    ];
    if (status) {
      query.push({ status });
    }
    return await this.queryAssignment(
      {
        query: query,
        items_per_page: "ALL",
      },
      false
    );
  };
  // get all assignment had been deleted
  static trash = async ({ items_per_page, page, nextPage, previousPage }) => {
    return await this.queryAssignment(
      {
        condition: true,
        items_per_page,
        page,
        nextPage,
        previousPage,
      },
      false
    );
  };
  // assignment information
  static detail = async (id) => {
    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id: id },
      select: this.select,
    });
    const userResponse = await getUser(assignment.user_id);
    const taskResponse = await getTask(assignment.task_id);
    const projectResponse = await getProject(assignment.project_id);
    if (userResponse) {
      assignment.user = userResponse;
    } else {
      assignment.user = null;
    }
    if (taskResponse) {
      assignment.task = taskResponse;
    } else {
      assignment.task = null;
    }
    if (projectResponse) {
      assignment.project = projectResponse;
    } else {
      assignment.project = null;
    }
    return assignment;
  };
  // update assignment
  static update = async ({ id, data }) => {
    const updateAssignment = await prisma.assignment.update({
      where: { assignment_id: id },
      data,
      select: this.select,
    });
    if (!updateAssignment) {
      throw new BadRequestError("Can't update assignment");
    }
    return updateAssignment;
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
  static queryAssignment = async (
    { query, items_per_page, page, search, nextPage, previousPage },
    isNotTrash = false
  ) => {
    const searchKeyword = search || "";
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
    if (isNotTrash) {
      const assignmentPromises = assignments.map(async (assignment) => {
        try {
          const userResponse = await getUser(assignment.user_id);
          const taskResponse = await getTask(assignment.task_id);
          const projectResponse = await getProject(assignment.project_id);
          if (userResponse) {
            assignment.user = userResponse;
          } else {
            assignment.user = null;
          }
          if (taskResponse) {
            assignment.task = taskResponse;
          } else {
            assignment.task = null;
          }
          if (projectResponse) {
            assignment.project = projectResponse;
          } else {
            assignment.project = null;
          }
        } catch (e) {
          console.log(e);
        }
      });
      await Promise.all(assignmentPromises);
    }

    return {
      assignments: assignments,
      total,
      nextPage: nextPageNumber,
      previousPage: previousPageNumber,
      currentPage,
      itemsPerPage,
    };
  };
  // consumer handle request
  static getTotalTaskWithStatusFromProjectAndTotalStaff = async (
    project_id
  ) => {
    const listOfAssignmentIsNotDone = await this.listOfAssignmentFromProject(
      project_id,
      false
    );
    const listOfAssignmentIsDone = await this.listOfAssignmentFromProject(
      project_id,
      true
    );
    const totalStaff = await this.getAllUserFromProject(project_id);
    if (
      listOfAssignmentIsNotDone.assignments &&
      listOfAssignmentIsDone.assignments
    ) {
      const taskIdsIsDone = listOfAssignmentIsDone.assignments.map(
        (assignment) => assignment.task_id
      );
      const taskIdsIsNotDone = listOfAssignmentIsNotDone.assignments.map(
        (assignment) => assignment.task_id
      );
      return {
        total_user: totalStaff.total,
        total_task_is_done: taskIdsIsDone.length,
        total_task_is_not_done: taskIdsIsNotDone.length,
      };
    }
    return null;
  };
}
module.exports = AssignmentService;
