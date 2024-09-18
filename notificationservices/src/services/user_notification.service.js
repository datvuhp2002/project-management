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
  static createMany = async (notifications) => {
    if (notifications.length === 0) {
      return { count: 0 };
    }
    const user_notifications = await prisma.userNotifications.createMany({
      data: notifications,
    });
    return user_notifications;
  };
  static markAsRead = async (user_id, notification_id) => {
    const user_notification = await prisma.userNotifications.findFirst({
      where: { user_id, notification_id },
      select: this.select,
    });
    if (!user_notification)
      throw new AuthFailureError("Notification not found");
    if (user_notification.is_read) return user_notification;
    return await prisma.userNotifications.update({
      where: { user_notifications_id: user_notification.user_notifications_id },
      data: { is_read: true, read_at: new Date() },
      select: this.select,
    });
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
    // Setup whereClause
    const whereClause = {
      AND: [],
    };

    // Add conditions to whereClause if they exist
    if (query && query.length > 0) {
      whereClause.AND.push(...query);
    }

    // Calculate total notifications and total unread notifications
    const [total, total_unread_noti] = await Promise.all([
      prisma.userNotifications.count({ where: whereClause }),
      prisma.userNotifications.count({
        where: { ...whereClause, is_read: false },
      }),
    ]);

    // Setup pagination
    const itemsPerPage =
      items_per_page === "ALL" ? total : Number(items_per_page) || 10;
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * itemsPerPage;

    // Get notifications for the current page
    const notifications = await prisma.userNotifications.findMany({
      take: itemsPerPage,
      skip,
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: this.select,
    });

    // Calculate pagination details
    const lastPage = Math.ceil(total / itemsPerPage);

    // Return results
    return {
      notifications,
      total,
      total_unread_noti,
      nextPage: currentPage < lastPage ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
      lastPage,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = UserNotificationService;
