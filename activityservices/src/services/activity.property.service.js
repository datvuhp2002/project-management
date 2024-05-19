"use strict";
const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
class ActivityPropertyService {
  static create = async (data) => {
    if (!data.user_property_id || !data.task_property_id) {
      return;
    }
    const newActivityProperty = await prisma.activityProperty.create({
      data: { ...data },
    });
    if (newActivityProperty) {
      return {
        code: 201,
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
  static update = async (data, activity_id) => {
    return await prisma.activityProperty.update({
      where: { activity_id },
      data: {
        ...data,
      },
    });
  };
  static delete = async (activity_id) => {
    return await prisma.activityProperty.update({
      where: { activity_id },
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
  };
  static restore = async (activity_id) => {
    return await prisma.activityProperty.update({
      where: { activity_id },
      data: { deletedMark: false, deletedAt: null },
    });
  };
  static getAll = async () => {
    return await prisma.activityProperty.findMany();
  };
}
module.exports = ActivityPropertyService;
