"use strict";
const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
class TaskPropertyService {
  static create = async (data) => {
    try {
      const newTaskProperty = await prisma.taskProperty.create({
        data,
      });
    } catch (err) {
      console.log(err.message);
    }
    // if (newTaskProperty) {
    //   return {
    //     code: 201,
    //   };
    // }
    // return {
    //   code: 200,
    //   metadata: null,
    // };
  };
  static update = async (data, Task_id) => {
    return await prisma.TaskProperty.update({
      where: { Task_id },
      data: {
        ...data,
      },
    });
  };
  static delete = async (task_id) => {
    return await prisma.taskProperty.update({
      where: { task_id },
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
  };
  static restore = async (task_id) => {
    return await prisma.taskProperty.update({
      where: { task_id },
      data: { deletedMark: false, deletedAt: null },
    });
  };
  static getAll = async () => {
    return await prisma.TaskProperty.findMany();
  };
}
module.exports = TaskPropertyService;
