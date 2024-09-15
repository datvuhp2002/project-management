"use strict";

const prisma = require("../prisma");
const { BadRequestError } = require("../core/error.response");
const {
  getUser,
  getTask,
  getProject,
  getListProjectInDepartment,
} = require("./grpcClient.services");
const { runProducer } = require("../message_queue/producer");
const { taskProducerTopic } = require("../configs/kafkaTaskTopic");
const {
  activityProducerTopic,
} = require("../configs/kafkaActivityTopic/producer/activity.producer.topic.config");
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
  // Create new assignment
  static create = async (data, createdBy) => {
    const { project_id, task_id, user_id, startAt, endAt } = data;
    const projectInfo = await getProject(project_id);
    const userInfo = await getUser(createdBy);
    if (
      userInfo.role_name === "STAFF" &&
      createdBy !== projectInfo.project_manager_id
    ) {
      throw new BadRequestError(
        "You do not have permission to create assignment for this project"
      );
    }
    // 1. Kiểm tra dự án tồn tại
    try {
      await getProject(project_id);
    } catch (e) {
      throw new BadRequestError("Project does not exist");
    }

    // Kiểm tra nếu có task_id
    if (task_id) {
      try {
        await getTask(task_id);
      } catch (e) {
        throw new BadRequestError("Task does not exist");
      }
    }
    if (user_id) {
      try {
        await getTask(user_id);
      } catch (e) {
        throw new BadRequestError("User does not exist");
      }
    }
    // Kiểm tra tính hợp lệ của thời gian
    if (startAt && endAt) {
      const startDateAssignment = new Date(startAt);
      const endDateAssignment = new Date(endAt);
      if (endDateAssignment <= startDateAssignment) {
        throw new BadRequestError(
          "End date cannot be equal or earlier than start date"
        );
      }
    }

    // 2. Xử lý các trường hợp tạo assignment

    // Trường hợp 1: Chỉ có project_id và task_id
    if (project_id && task_id && !user_id) {
      const existingTaskAssignment = await prisma.assignment.findFirst({
        where: {
          project_id,
          task_id,
          deletedMark: false,
        },
      });

      if (existingTaskAssignment) {
        throw new BadRequestError(
          "Task is already assigned within the project"
        );
      }

      const assignment = await prisma.assignment.create({
        data: {
          project_id,
          task_id,
          startAt,
          endAt,
          createdBy,
        },
        select: this.select,
      });
      return assignment;
    }

    // Trường hợp 2: Chỉ có project_id và user_id
    if (project_id && user_id && !task_id) {
      const existingUserAssignment = await prisma.assignment.findFirst({
        where: {
          project_id,
          user_id,
          deletedMark: false,
        },
      });

      if (existingUserAssignment) {
        throw new BadRequestError("User is already assigned to the project");
      }

      const assignment = await prisma.assignment.create({
        data: {
          project_id,
          user_id,
          task_id: null,
          startAt,
          endAt,
          createdBy,
        },
        select: this.select,
      });
      return assignment;
    }

    // Trường hợp 3: Có cả project_id, task_id và user_id
    if (project_id && task_id && user_id) {
      const existingAssignment = await prisma.assignment.findFirst({
        where: {
          project_id,
          task_id,
          deletedMark: false,
        },
      });

      if (existingAssignment) {
        // Nếu assignment đã tồn tại, chỉ cần cập nhật user_id
        const updatedAssignment = await prisma.assignment.update({
          where: { assignment_id: existingAssignment.assignment_id },
          data: { user_id, modifiedBy: createdBy },
          select: this.select,
        });
        return updatedAssignment;
      }

      // Nếu chưa tồn tại assignment, tạo mới
      const newAssignment = await prisma.assignment.create({
        data: {
          project_id,
          task_id,
          user_id,
          startAt,
          endAt,
          createdBy,
        },
        select: this.select,
      });
      return newAssignment;
    }

    // Nếu không khớp trường hợp nào, trả về lỗi
    throw new BadRequestError("Invalid assignment data");
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
    if (status) {
      query.push({ status: Number(status) });
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

      case "task":
        return await this.getAllAssignmentForTask(query, id);

      default:
        return await this.getAllAssignmentForUser(query, id);
    }
  };
  static getAllAssignmentForUser = async (
    { items_per_page, page, search, nextPage, previousPage, status },
    user_id
  ) => {
    let query = [];
    query.push({ deletedMark: false, user_id });
    if (status) {
      query.push({ status: Number(status) });
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
    if (status) {
      query.push({ status: Number(status) });
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
    if (status) {
      query.push({ status: Number(status) });
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
  static removeStaffFromProject = async (project_id, user_ids, modifiedBy) => {
    try {
      const manager_info = await getUser(modifiedBy);
      const projectInfo = await getProject(project_id);
      let filterUser_ids = user_ids;
      if (
        manager_info.role_name === "STAFF" &&
        modifiedBy !== projectInfo.project_manager_id
      ) {
        throw new BadRequestError("You do not have permission to remove staff");
      }
      if (
        manager_info.role_name !== "ADMIN" &&
        manager_info.role_name !== "SUPER_ADMIN" &&
        modifiedBy !== projectInfo.project_manager_id
      ) {
        const managerDepartmentId = manager_info.department_id;
        filterUser_ids = await Promise.all(
          user_ids.map(async (user_id) => {
            try {
              const userInfo = await getUser(user_id);
              if (userInfo.department_id === managerDepartmentId) {
                return user_id;
              }
              return null;
            } catch (error) {
              console.error(
                `Error fetching information for user ${user_id}:`,
                error
              );
              return null;
            }
          })
        );
        filterUser_ids = filterUser_ids.filter((id) => id !== null);
      }
      const removeStaff = await prisma.assignment.deleteMany({
        where: {
          project_id,
          user_id: { in: filterUser_ids },
          task_id: null,
        },
      });
      const updateAssignment = await prisma.assignment.updateMany({
        where: {
          project_id,
          user_id: { in: filterUser_ids },
        },
        data: {
          user_id: null,
        },
      });

      // Kiểm tra nếu có bản ghi bị xóa hoặc cập nhật
      if (removeStaff.count > 0 || updateAssignment.count > 0) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error removing staff from project:", error);
      return false;
    }
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
  static getAllTaskFromProject = async (project_id, status = null) => {
    const listOfAssignment = await this.listOfAssignmentFromProject(
      project_id,
      status
    );
    if (listOfAssignment.assignments) {
      const taskIds = listOfAssignment.assignments
        .filter((assignment) => assignment.task_id !== null)
        .map((assignment) => assignment.task_id);

      const uniqueTaskIds = [...new Set(taskIds)];
      return uniqueTaskIds;
    }
    return null;
  };
  // consumer handle request
  static getTotalTaskWithStatusFromProjectAndTotalStaff = async (
    project_id
  ) => {
    const taskIdsIsTodo = await this.getAllTaskFromProject(project_id, 0);
    const taskIdsIsOnProgress = await this.getAllTaskFromProject(project_id, 1);
    const taskIdsIsDone = await this.getAllTaskFromProject(project_id, 2);
    // calculator
    const totalStaff = await this.getAllUserFromProject(project_id);
    return {
      total_user: totalStaff.total,
      total_task_is_done: taskIdsIsDone.length,
      total_task_is_not_done: taskIdsIsOnProgress.length + taskIdsIsTodo.length,
    };
  };
  // list of task from project
  static listOfAssignmentFromProject = async (project_id, status) => {
    let query = [
      {
        deletedMark: false,
        project_id,
      },
    ];
    if (status !== null) {
      query.push({ status: Number(status) });
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
    try {
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
    } catch (e) {
      console.log("Something was wrong:::", e);
    }
  };
  // update assignment
  static update = async ({ id, data }, modifiedBy) => {
    data.modifiedBy = modifiedBy;
    // Check if the assignment exists
    const findAssignment = await prisma.assignment.findUnique({
      where: { assignment_id: id },
    });
    if (!findAssignment) throw new BadRequestError("Can't find assignment");
    // Update the assignment
    const updateAssignment = await prisma.assignment.update({
      where: { assignment_id: id },
      data,
      select: this.select,
    });
    if (!updateAssignment) {
      throw new BadRequestError("Can't update assignment");
    }
    // Check and handle status updates
    if (findAssignment.task_id !== null) {
      const task = await getTask(findAssignment.task_id);
      let status;
      switch (data.status) {
        case 0:
          status = "to do";
          break;
        case 1:
          status = "on progress";
          break;
        case 2:
          status = "done";
          break;
        default:
          status = "unknown";
          break;
      }
      const message = {
        createdBy: modifiedBy,
        task: task.name,
        task_id: findAssignment.task_id,
        status: status,
      };
      await runProducer(activityProducerTopic.updatedStatusAssignment, message);
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
  static forceDeleteProjectAssignment = async (project_id) => {
    const listDataByProject = await this.getAllTaskFromProject(
      project_id,
      null
    );
    const forceDeleteAssignment = await prisma.assignment.deleteMany({
      where: { project_id },
    });
    if (!forceDeleteAssignment) {
      throw new BadRequestError("Can't delete project assignment");
    }
    await runProducer(taskProducerTopic.forceDeleteProject, listDataByProject);
  };
  static forceDeleteTaskAssignment = async (task_id) => {
    return await prisma.assignment.deleteMany({
      where: { task_id },
    });
  };
  static forceDeleteUserAssignment = async (user_id) => {
    return await prisma.assignment.deleteMany({
      where: { user_id },
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
  static getAllUserProject = async (user_id) => {
    const list_project = await prisma.assignment.findMany({
      where: { user_id },
    });
    if (list_project) {
      const projectIds = list_project.map((item) => item.project_id);
      const uniqueProjectIds = [...new Set(projectIds)];
      return uniqueProjectIds;
    } else {
      return [];
    }
  };
}
module.exports = AssignmentService;
