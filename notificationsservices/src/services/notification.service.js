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
    const user = await getUser(createdBy);
    const message = `${content} by ${user.username}`;
    return await prisma.notifications.create({
      data: { content: message, createdBy },
    });
  };
}
module.exports = NotificationService;
