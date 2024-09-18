"use strict";

const NotificationService = require("../services/notification.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class NotificationController {
  /**
   * @param {items_per_page}
   * @param {page}
   * @param {search}
   * @param {nextPage}
   * @param {previousPage}
   * @param {role}
   */
  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Get List Of Notifications",
      data: await NotificationService.getAll(req.query),
    }).send(res);
  };
}

module.exports = new NotificationController();
