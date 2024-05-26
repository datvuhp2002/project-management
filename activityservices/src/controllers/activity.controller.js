"use strict";

const ActivityService = require("../services/activity.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class ActivityController {
  create = async (req, res, next) => {
    new CREATED({
      message: "Tạo hoạt động mới thành công",
      data: await ActivityService.create(
        req.body,
        req.headers.user,
        req.headers.user_property
      ),
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
  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách hoạt động thành công",
      data: await ActivityService.getAll(req.query),
    }).send(res);
  };
  getAllActivitiesByUserProperty = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách hoạt động thành công",
      data: await ActivityService.getAllActivitiesByUserProperty(
        req.query,
        req.params.id
      ),
    }).send(res);
  };
  getAllActivitiesByYourProperty = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách hoạt động thành công",
      data: await ActivityService.getAllActivitiesByUserProperty(
        req.query,
        req.headers.user_property
      ),
    }).send(res);
  };
  getAllActivitiesFromTask = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách hoạt động thành công",
      data: await ActivityService.getAllActivitiesFromTask(
        req.query,
        req.params.id
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
