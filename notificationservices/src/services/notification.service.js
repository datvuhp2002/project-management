"use strict";

const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { getUser } = require("./grpcClient.services");
class NotificationService {
  static select = {
    notification_id: true,
    content: true,
    createdBy: true,
    modifiedBy: true,
    createdAt: true,
  };
  // create a new activity
  static create = async (content, createdBy) => {
    if (createdBy) {
      const user = await getUser(createdBy);
      const message = `${content} by ${user.username}`;
      return await prisma.notifications.create({
        data: { content: message, createdBy },
      });
    }
    return await prisma.notifications.create({
      data: { content },
    });
  };
  // get all staffs
  static getAll = async ({ items_per_page, page }) => {
    let query = [];
    return await this.queryNotifications({
      query: query,
      items_per_page,
      page,
    });
  };
  // Query notifications
  static queryNotifications = async ({ query, items_per_page, page }) => {
    let whereClause = {
      AND: [],
    };
    if (query && query.length > 0) {
      whereClause.AND.push(...query);
    }
    const total = await prisma.notifications.count({
      where: whereClause,
    });
    const itemsPerPage =
      items_per_page === "ALL" ? total : Number(items_per_page) || 10;
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * itemsPerPage;
    const notifications = await prisma.notifications.findMany({
      take: itemsPerPage,
      skip,
      select: this.select,
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    const lastPage = Math.ceil(total / itemsPerPage);
    return {
      notifications,
      total,
      nextPage: currentPage + 1 > lastPage ? null : currentPage + 1,
      previousPage: currentPage - 1 < 1 ? null : currentPage - 1,
      lastPage,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = NotificationService;
