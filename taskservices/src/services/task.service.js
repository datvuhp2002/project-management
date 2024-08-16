"use strict";

const prisma = require("../prisma");
const cloudinary = require("../configs/cloudinary.config");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { runProducer } = require("../message_queue/producer");
const {
  ActivityProducerTopic,
} = require("../configs/kafkaActivityTopic/producer/activity.producer.topic.config");
const {
  GetAllTaskFromProject,
  TotalActivity,
} = require("./grpcClient.services");
const {
  uploadProducerTopic,
} = require("../configs/kafkaUploadTopic/producer/upload.producer.topic.config");
class TaskService {
  static select = {
    task_id: true,
    name: true,
    description: true,
    document: true,
    createdBy: true,
    modifiedBy: true,
    createdAt: true,
  };
  // create a new task
  static create = async (data, createdBy) => {
    const newTask = await prisma.task.create({
      data: { ...data, createdBy },
    });
    if (newTask) {
      await runProducer(ActivityProducerTopic.taskCreated, {
        task_id: newTask.task_id,
        name: newTask.name,
        createdBy,
      });
      return newTask;
    }
    throw new BadRequestError("Can't create task");
  };
  // get All tasks by task property
  static getAllTaskByTaskIds = async (
    { items_per_page, page, search, nextPage, previousPage },
    { task_ids }
  ) => {
    let query = [];
    query.push({
      task_id: {
        in: task_ids,
      },
    });
    query.push({
      deletedMark: false,
    });
    return await this.queryTask({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  static getListDetailTask = async ({ task_id }) => {
    if (task_id === null || task_id === undefined) return null;
    const task = await prisma.task.findUnique({
      where: { task_id, deletedMark: false },
      select: this.select,
    });
    return task;
  };
  static getAllTaskInProject = async (query, project_id) => {
    const task_ids = await GetAllTaskFromProject(project_id);
    return await this.getAllTaskByTaskIds(query, { task_ids });
  };
  // get all tasks
  static getAll = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    let query = [];
    query.push({
      deletedMark: false,
    });
    return await this.queryTask({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // get all tasks has been deleted
  static trash = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    let query = [];
    query.push({
      deletedMark: true,
    });
    return await this.queryTask({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // detail task
  static detail = async (task_id) => {
    const task = await prisma.task.findUnique({
      where: { task_id },
      select: this.select,
    });
    if (!task) throw new BadRequestError("Task not found");
    const total = await TotalActivity(task_id);
    task.total_activities = total;
    return task;
  };
  // update task
  static update = async ({ task_id, data }, modifiedBy) => {
    const existingTask = await prisma.task.findUnique({ where: { task_id } });
    if (!existingTask) throw new BadRequestError("Task not found");
    let updateTask;
    if (data.document) {
      updateTask = await prisma.task.update({
        where: { task_id },
        data: {
          document: [...existingTask.document, data.document],
          modifiedBy,
        },
      });
    } else {
      updateTask = await prisma.task.update({
        where: { task_id },
        data: { ...data, modifiedBy },
      });
    }
    if (updateTask) {
      await runProducer(ActivityProducerTopic.taskUpdated, {
        task_id: updateTask.task_id,
        name: updateTask.name,
        modifiedBy,
      });
      return true;
    }
    return false;
  };

  // delete task
  static delete = async (task_id) => {
    const deleteTask = await prisma.task.update({
      where: { task_id },
      select: this.select,
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
    if (deleteTask) {
      return true;
    }
    this.restore(task_id);
    return false;
  };
  static deleteFile = async ({ task_id, filename }) => {
    const task = await prisma.task.findUnique({ where: { task_id } });
    if (!task) throw new BadRequestError("Task not found");
    const updatedDocuments = task.document.filter((doc) => doc !== filename);
    const updateTask = await prisma.task.update({
      where: { task_id },
      data: { document: updatedDocuments },
    });
    if (!updateTask) throw new BadRequestError("Can not delete this file");
    return true;
  };
  // restore project
  static restore = async (task_id) => {
    const restoreTask = await prisma.task.update({
      where: { task_id },
      data: {
        deletedMark: false,
      },
    });
    if (!restoreTask) {
      await this.delete(task_id);
      throw new BadRequestError("Can't restore task");
    }
    return true;
  };
  static queryTask = async ({
    query,
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    const currentPage = Number(page) || 1;
    const searchKeyword = search || "";
    let itemsPerPage = 10;
    let whereClause = {
      OR: [
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
    const total = await prisma.task.count({
      where: whereClause,
    });
    if (items_per_page !== "ALL") {
      itemsPerPage = Number(items_per_page) || 10;
    } else {
      itemsPerPage = total;
    }
    const skip = currentPage > 1 ? (currentPage - 1) * itemsPerPage : 0;

    const tasks = await prisma.task.findMany({
      take: itemsPerPage,
      skip,
      select: this.select,
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });
    const taskPromises = tasks.map(async (task, index) => {
      const result = await TotalActivity(task.task_id);
      task.total_activities = result;
    });
    await Promise.all(taskPromises);
    const lastPage = Math.ceil(total / itemsPerPage);
    const nextPageNumber = currentPage + 1 > lastPage ? null : currentPage + 1;
    const previousPageNumber = currentPage - 1 < 1 ? null : currentPage - 1;
    return {
      data: tasks,
      total,
      nextPage: nextPageNumber,
      previousPage: previousPageNumber,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = TaskService;
