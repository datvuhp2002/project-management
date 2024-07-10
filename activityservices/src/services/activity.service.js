"use strict";

const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { getUser } = require("./grpcClient.services");
class ActivityService {
  static select = {
    activity_id: true,
    task_id: true,
    description: true,
    createdBy: true,
    createdAt: true,
  };
  // create a new activity
  static create = async (data, createdBy) => {
    const activity = await prisma.activity.create({
      data: { ...data, createdBy },
    });
    if (!activity) {
      throw new BadRequestError("Create activity failed");
    }
    return activity;
  };
  // get all activities
  static getAllActivities = async (
    { items_per_page, page, search, nextPage, previousPage, target },
    task_id,
    createdBy
  ) => {
    let query = [];
    if (target && target == "user") {
      query.push({
        createdBy,
      });
    }
    query.push({
      task_id,
      deletedMark: false,
    });
    return await this.queryActivity(
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
    return await this.queryActivity(
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
    if (!deleteActivity) {
      throw new BadRequestError(`Can not delete activity`);
    }
    return true;
  };
  // restore project
  static restore = async (activity_id) => {
    const restoreActivity = await prisma.activity.update({
      where: { activity_id },
      data: {
        deletedMark: false,
      },
    });
    if (!restoreActivity) {
      throw new BadRequestError(`Can not restore activity`);
    }
    return true;
  };
  static getAllActivitiesByYear = async (
    { year = new Date().getFullYear() },
    task_id
  ) => {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    const whereClause = {
      AND: [
        {
          task_id: {
            equals: task_id,
          },
        },
        {
          createdAt: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      ],
    };
    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "asc",
      },
      select: this.select,
    });
    const activitiesByDate = {};
    activities.forEach((activity) => {
      const createdAtDate = activity.createdAt.toISOString().split("T")[0];
      if (!activitiesByDate[createdAtDate]) {
        activitiesByDate[createdAtDate] = [];
      }
      activitiesByDate[createdAtDate].push(activity);
    });

    return activitiesByDate;
  };
  static queryActivity = async (
    { query, items_per_page, page, search, nextPage, previousPage },
    isNotTrash = false
  ) => {
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
    if (isNotTrash) {
      const activityPromises = activities.map(async (activity, index) => {
        const userResponse = await getUser(activity.createdBy);
        if (userResponse) {
          activity.user = userResponse;
        } else {
          activity.user = null;
        }
      });

      await Promise.all(activityPromises);
    }
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
