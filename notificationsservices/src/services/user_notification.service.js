"use strict";

const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
class UserNotificationService {
  static select = {
    user_notifications_id: true,
    user_id: true,
    notification_id: true,
    is_read: true,
    read_at: true,
    createdAt: true,
    notifications: {
      select: {
        content: true,
      },
    },
  };
  // create a new activity
  static create = async (user_id, notification_id) => {
    const user_notifications = await prisma.userNotifications.create({
      data: { user_id, notification_id },
      select: this.select,
    });
    return user_notifications;
  };
  static getAllNotificationsOfUser = async (
    { items_per_page, page },
    user_id
  ) => {
    console.log(user_id);
    if (!user_id) throw new BadRequestError("User not found");
    let query = [
      {
        user_id,
      },
    ];
    return await this.queryUserNotifications({
      query,
      items_per_page,
      page,
    });
  };
  // query Notifications
  static queryUserNotifications = async ({ query, items_per_page, page }) => {
    // setup (whereClause)
    let whereClause = {
      AND: [],
    };

    // if have conditions for searching add them to whereClause
    if (query && query.length > 0) {
      whereClause.AND.push(...query);
    }

    // calculator total of noti
    const total = await prisma.userNotifications.count({
      where: whereClause,
    });

    // set up item per page and current page
    const itemsPerPage =
      items_per_page === "ALL" ? total : Number(items_per_page) || 10;
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * itemsPerPage;

    // Get list noti of user
    const notifications = await prisma.userNotifications.findMany({
      take: itemsPerPage,
      skip,
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        user_notifications_id: true,
        is_read: true,
        notifications: true, // Bao gồm thông tin từ bảng Notifications
      },
    });

    // calculator last page (lastPage)
    const lastPage = Math.ceil(total / itemsPerPage);

    // return results
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
module.exports = UserNotificationService;
