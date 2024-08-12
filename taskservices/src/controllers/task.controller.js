"use strict";

const TaskService = require("../services/task.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class TaskController {
  create = async (req, res, next) => {
    new CREATED({
      message: "Tạo nhiệm vụ mới thành công",
      data: await TaskService.create(req.body, req.headers.user),
    }).send(res);
  };
  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách nhiệm vụ thành công",
      data: await TaskService.getAll(req.query),
    }).send(res);
  };
  getAllTaskByTaskIds = async (req, res, next) => {
    console.log(req.body);
    new CREATED({
      message: "lấy danh sách nhiệm vụ trong dự án thành công",
      data: await TaskService.getAllTaskByTaskIds(req.query, req.body),
    }).send(res);
  };
  getAllTaskInProject = async (req, res, next) => {
    console.log(req.body);
    new CREATED({
      message: "lấy danh sách nhiệm vụ trong dự án thành công",
      data: await TaskService.getAllTaskInProject(req.query, req.params.id),
    }).send(res);
  };
  trash = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách nhiệm vụ bị xoá thành công",
      data: await TaskService.trash(req.query),
    }).send(res);
  };
  detail = async (req, res, next) => {
    new SuccessResponse({
      message: "Thông tin nhiệm vụ",
      data: await TaskService.detail(req.params.id),
    }).send(res);
  };
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật nhiệm vụ thành công",
      data: await TaskService.update(
        { task_id: req.params.id, data: req.body },
        req.headers.user
      ),
    }).send(res);
  };

  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá thành công nhiệm vụ",
      data: await TaskService.delete(req.params.id),
    }).send(res);
  };
  restore = async (req, res, next) => {
    new SuccessResponse({
      message: "Khôi phục thành công nhiệm vụ",
      data: await TaskService.restore(req.params.id),
    }).send(res);
  };
  // uploadFileFromLocal = async (req, res, next) => {
  //   const { file } = req;
  //   if (!file) {
  //     throw new BadRequestError("File is missing");
  //   }
  //   new SuccessResponse({
  //     message: "Tải file lên thành công",
  //     data: await TaskService.uploadFile(req.params.id, file),
  //   }).send(res);
  // };
  // getFileImage = async (req, res, next) => {
  //   new SuccessResponse({
  //     message: "Tải file lên thành công",
  //     data: await TaskService.getFileImage(req.body),
  //   }).send(res);
  // };
  // getFile = async (req, res, next) => {
  //   new SuccessResponse({
  //     message: "lấy file về thành công",
  //     data: await TaskService.getFile(req.body),
  //   }).send(res);
  // };
  deleteFile = async (req, res, next) => {
    new SuccessResponse({
      message: "xoá file thành công",
      data: await TaskService.deleteFile(req.params.id, req.body),
    }).send(res);
  };
}

module.exports = new TaskController();
