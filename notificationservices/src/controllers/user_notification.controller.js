"use strict";

const UserNotificationService = require("../services/user_notification.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class UserNotificationController {
  /**
   * @param {items_per_page}
   * @param {page}
   * @param {search}
   * @param {nextPage}
   * @param {previousPage}
   * @param {role}
   */
  getAllNotificationsOfUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Get List Of Notifications",
      data: await UserNotificationService.getAllNotificationsOfUser(
        req.query,
        req.headers.user
      ),
    }).send(res);
  };
  markAsRead = async (req, res, next) => {
    new SuccessResponse({
      message: "Read notification successfully",
      data: await UserNotificationService.markAsRead(
        req.headers.user,
        req.params.id
      ),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Read notification successfully",
      data: await UserNotificationService.delete(
        req.headers.user,
        req.params.id
      ),
    }).send(res);
  };
  readMany = async (req, res, next) => {
    new SuccessResponse({
      message: "Read notifications successfully",
      data: await UserNotificationService.readMany(req.headers.user),
    }).send(res);
  };
}

module.exports = new UserNotificationController();
