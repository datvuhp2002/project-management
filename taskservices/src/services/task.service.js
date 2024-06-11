"use strict";

const prisma = require("../prisma");
const cloudinary = require("../configs/cloudinary.config");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { assignmentProducerTopic } = require("../configs/kafkaAssignmentTopic");
const {
  runConsumerAssignmentOnDemand,
} = require("../message_queue/consumer.assignment.demand");
const { runProducer } = require("../message_queue/producer");
class TaskService {
  static select = {
    task_id: true,
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
    await runProducer(
      assignmentProducerTopic.getListTaskFromProject,
      project_id
    );
    const task_ids = await runConsumerAssignmentOnDemand();
    console.log("list task:", task_ids);
    return await this.getAllTaskByTask(query, { task_ids });
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
    return task;
  };
  // update task
  static update = async ({ task_id, data }, modifiedBy) => {
    const updateTask = await prisma.task.update({
      where: { task_id },
      data: { ...data, modifiedBy },
    });
    if (updateTask) return true;
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
  // upload file to cloud and store it in db
  static uploadFile = async (task_id, { path, filename }) => {
    const existingTask = await prisma.task.findUnique({
      where: { task_id },
    });
    if (!existingTask) {
      await cloudinary.uploader.destroy(filename);
      throw new BadRequestError("Nhiệm vụ không tồn tại");
    }
    try {
      const uploadFile = await prisma.task.update({
        where: { task_id },
        data: {
          document: [...existingTask.document, filename],
        },
      });
      if (uploadFile) return true;
      await cloudinary.uploader.destroy(filename);
      return false;
    } catch (e) {
      throw new BadRequestError(`Đã sảy ra lỗi: ${e.message}`);
    }
  };
  // get Image File from cloudinary
  static getFileImage = async ({ filename }) => {
    const options = {
      height: 500,
      width: 500,
      format: "jpg",
    };
    try {
      const result = await cloudinary.url(filename, options);
      return result;
    } catch (error) {
      console.error(error);
    }
    return await cloudinary.image(filename);
  };
  static getFile = async ({ filename }) => {
    try {
      const result = await cloudinary.url(filename, { resource_type: "raw" });
      return result;
    } catch (error) {
      console.error(error);
    }
  };
  static deleteFile = async (task_id, { filename }) => {
    const existingTask = await prisma.task.findUnique({
      where: { task_id },
    });
    if (!existingTask) throw new BadRequestError("Nhiệm vụ không tồn tại");
    try {
      const updatedDocument = existingTask.document.filter(
        (file) => file !== filename
      );
      const uploadFile = await prisma.task.update({
        where: { task_id },
        data: {
          document: updatedDocument,
        },
      });
      if (uploadFile) {
        cloudinary.uploader.destroy(filename);
        return true;
      }
      return false;
    } catch (e) {
      throw new BadRequestError(`Đã sảy ra lỗi: ${e.message}`);
    }
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
