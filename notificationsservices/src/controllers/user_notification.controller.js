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
}

module.exports = new UserNotificationController();
