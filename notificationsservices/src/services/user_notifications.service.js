"use strict";

const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
class UserNotifications {
  static select = {
    user_notifications_id: true,
    user_ids: true,
    notification_id: true,
    is_read: true,
    read_at: true,
    createdAt: true,
    notifications: {
      select: {
        content: true,
        name: true,
      },
    },
  };
  // create a new activity
  static create = async (user_ids, notification_id) => {
    const user_notifications = await prisma.notifications.create({
      data: { user_ids, notification_id },
    });
    return user_notifications;
  };
}
module.exports = UserNotifications;
