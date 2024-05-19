"use strict";

const prisma = require("../prisma");
const ActivityPropertyService = require("./activity.property.service");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
class ActivityService {
  static select = {
    activity_id: true,
    description: true,
    createdBy: true,
    modifiedBy: true,
    createdAt: true,
    ActivityProperty: {
      select: {
        activity_property_id: true,
        user_property_id: true,
        activity_id: true,
      },
    },
  };
  // create a new activity
  static create = async (data, createdBy, user_property_id) => {
    const { task_property_id, ...activityData } = data;
    const newActivity = await prisma.activity.create({
      data: { ...activityData, createdBy },
    });
    if (newActivity) {
      const newActivityProperty = await ActivityPropertyService.create({
        activity_id: newActivity.activity_id,
        user_property_id,
        task_property_id,
      });
      if (newActivityProperty) {
        return true;
      }
      await prisma.activity.delete({
        where: { activity_id: newActivity.activity_id },
      });
      throw new BadRequestError("Tạo mới không thành công, vui lòng thử lại");
    }
    return {
      code: 200,
      data: null,
    };
  };
  // get all activities
  static getAllActivitiesByUserProperty = async (
    { items_per_page, page, search, nextPage, previousPage },
    user_property_id
  ) => {
    console.log(user_property_id);
    let query = [];
    query.push({
      ActivityProperty: {
        user_property_id,
      },
    });
    query.push({
      deletedMark: false,
    });
    return await this.queryActivity({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
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
    return await this.queryActivity({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // get all activities from task
  static getAllActivitiesFromTask = async (
    { items_per_page, page, search, nextPage, previousPage },
    task_property_id
  ) => {
    let query = [];
    query.push({
      ActivityProperty: {
        task_property_id,
      },
      deletedMark: false,
    });
    return await this.queryActivity({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // get all activities has been deleted
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
    return await this.queryActivity({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  // detail activity
  static detail = async (activity_id) => {
    return await prisma.activity.findUnique({
      where: { activity_id },
      select: this.select,
    });
  };
  // update activity
  static update = async (activity_id, data, modifiedBy) => {
    const updateActivity = await prisma.activity.update({
      where: { activity_id },
      data: { ...data, modifiedBy },
    });
    if (updateActivity) return true;
    return false;
  };
  // delete activity
  static delete = async (activity_id) => {
    const deleteActivity = await prisma.activity.update({
      where: { activity_id },
      select: this.select,
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
    if (deleteActivity) {
      await ActivityPropertyService.delete(activity_id);
      return true;
    }
    return null;
  };
  // restore project
  static restore = async (activity_id) => {
    const restoreActivity = await prisma.activity.update({
      where: { activity_id },
      data: {
        deletedMark: false,
      },
    });
    if (restoreActivity) {
      const restoreActivityProperty = await ActivityPropertyService.restore(
        activity_id
      );
      if (restoreActivityProperty) return true;
      await this.delete(activity_id);
      return null;
    }
    return null;
  };

  static queryActivity = async ({
    query,
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    const searchKeyword = search || "";
    let itemsPerPage;
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
    const total = await prisma.activity.count({
      where: whereClause,
    });
    if (items_per_page !== "ALL") {
      itemsPerPage = Number(items_per_page) || 10;
    } else {
      itemsPerPage = total;
    }
    const currentPage = Number(page) || 1;
    const skip = currentPage > 1 ? (currentPage - 1) * itemsPerPage : 0;

    const activities = await prisma.activity.findMany({
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
      data: activities,
      total,
      nextPage: nextPageNumber,
      previousPage: previousPageNumber,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = ActivityService;
