"use strict";

const ActivityService = require("../services/activity.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class ActivityController {
  create = async (req, res, next) => {
    new CREATED({
      message: "Tạo hoạt động mới thành công",
      data: await ActivityService.create(req.body, req.headers.user),
    }).send(res);
  };
  getAllActivitiesByYear = async (req, res, next) => {
    new SuccessResponse({
      message: "Danh sách hoạt động trong năm thành công",
      data: await ActivityService.getAllActivitiesByYear(
        req.query,
        req.params.id
      ),
    }).send(res);
  };
  /**
   *
   * @param {id} task_id
   * @param {target} task || user
   * @description get all activities from task and all activities of user in task
   */
  getAllActivities = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách hoạt động thành công",
      data: await ActivityService.getAllActivities(
        req.query,
        req.params.id,
        req.headers.user
      ),
    }).send(res);
  };
  trash = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách hoạt động bị xoá thành công",
      data: await ActivityService.trash(req.query),
    }).send(res);
  };
  detail = async (req, res, next) => {
    new SuccessResponse({
      message: "Thông tin hoạt động",
      data: await ActivityService.detail(req.params.id),
    }).send(res);
  };
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật hoạt động thành công",
      data: await ActivityService.update(
        req.params.id,
        req.body,
        req.headers.user
      ),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá thành công hoạt động",
      data: await ActivityService.delete(req.params.id),
    }).send(res);
  };
  restore = async (req, res, next) => {
    new SuccessResponse({
      message: "Khôi phục thành công hoạt động",
      data: await ActivityService.restore(req.params.id),
    }).send(res);
  };
}

module.exports = new ActivityController();
