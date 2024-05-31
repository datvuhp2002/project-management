"use strict";

const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { ObjectId } = require("mongodb");
const { getUserByUserPropertyIds } = require("../utils");
const { runConsumerOnDemand } = require("../message_queue/consumer.demand");
const { runProducer } = require("../message_queue/producer");
const { taskProducerTopic } = require("../configs/kafkaTaskTopic");
const {
  userProducerTopic,
} = require("../configs/kafkaUserTopic/producer/user.producer.topic.config");
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
  static getAllAssignmentForUser = async (
    { items_per_page, page, search, nextPage, previousPage, status },
    user_property_id
  ) => {
    let query = [];
    query.push({ deletedMark: false, user_property_id });
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
      isAssignment,
    },
    task_property_id
  ) => {
    let query = [];
    query.push({ deletedMark: false, task_property_id });
    if (status && status === "true") {
      query.push({ status: true });
    } else if (status && status === "false") {
      query.push({ status: false });
    }
    if (isAssignment && isAssignment === "true") {
      query.push(
        {
          user_property_id: { not: null },
        },
        {
          user_property_id: { not: undefined },
        }
      );
    } else if (isAssignment && isAssignment === "false") {
      query.push(
        {
          user_property_id: null,
        },
        {
          user_property_id: undefined,
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
      isAssignment,
    },
    project_property_id
  ) => {
    let query = [];
    query.push({ deletedMark: false, project_property_id });
    if (isAssignment && isAssignment === "true") {
      query.push(
        {
          user_property_id: { not: null },
        },
        {
          user_property_id: { not: undefined },
        }
      );
    } else if (isAssignment && isAssignment === "false") {
      query.push(
        {
          user_property_id: null,
        },
        {
          user_property_id: undefined,
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
      project_property_id,
      null
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
  // list of task property from project
  static getAllTaskPropertyFromProject = async (project_property_id) => {
    const listOfAssignment = await this.listOfAssignmentFromProject(
      project_property_id,
      null
    );
    if (listOfAssignment.assignments) {
      const taskPropertyIds = listOfAssignment.assignments
        .map((assignment) => assignment.task_property_id)
        .filter((id) => id !== null);
      const uniqueTaskPropertyIds = [...new Set(taskPropertyIds)];
      return uniqueTaskPropertyIds;
    }
    return null;
  };
  // list of task property from project
  static listOfAssignmentFromProject = async (project_property_id, status) => {
    let query = [
      {
        deletedMark: false,
        project_property_id,
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
      const assignment_list_id = assignments.map((assignment) => ({
        task_property_id: assignment.task_property_id,
      }));
      await runProducer(
        taskProducerTopic.getTaskInformation,
        assignment_list_id
      );
      const taskInformationData = await runConsumerOnDemand();
      console.log("received Data:::", taskInformationData);
      assignments.map((item, index) => {
        item.task_information = taskInformationData[index];
      });

      if (taskInformationData) {
        const user_list_id = assignments.map(
          (assignment) => assignment.user_property_id
        );
        await runProducer(userProducerTopic.getUserInformation, user_list_id);
        const userInformationData = await runConsumerOnDemand();
        console.log(userInformationData);
        assignments.map((item, index) => {
          item.user_information = userInformationData[index];
        });
      }
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
  static getTotalTaskPropertyWithStatusFromProject = async (
    project_property_id
  ) => {
    const listOfAssignmentIsNotDone = await this.listOfAssignmentFromProject(
      project_property_id,
      false
    );
    const listOfAssignmentIsDone = await this.listOfAssignmentFromProject(
      project_property_id,
      true
    );
    if (
      listOfAssignmentIsNotDone.assignments &&
      listOfAssignmentIsDone.assignments
    ) {
      const taskPropertyIdsIsDone = listOfAssignmentIsDone.assignments.map(
        (assignment) => assignment.task_property_id
      );
      const taskPropertyIdsIsNotDone =
        listOfAssignmentIsNotDone.assignments.map(
          (assignment) => assignment.task_property_id
        );
      // const uniqueTaskPropertyIdsIsDone = [...new Set(taskPropertyIdsIsDone)];
      // const uniqueTaskPropertyIdsIsNotDone = [
      //   ...new Set(taskPropertyIdsIsNotDone),
      // ];
      return {
        total_task_is_done: taskPropertyIdsIsDone.length,
        total_task_is_not_done: taskPropertyIdsIsNotDone.length,
      };
    }
    return null;
  };
}
module.exports = AssignmentService;
