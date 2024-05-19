"use strict";

const ProjectService = require("../services/project.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class ProjectController {
  create = async (req, res, next) => {
    new CREATED({
      message: "Tạo dự án mới thành công",
      data: await ProjectService.create(req.body, req.headers.user),
    }).send(res);
  };
  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách dự án thành công",
      data: await ProjectService.getAll(req.query),
    }).send(res);
  };
  getAllProjectInDepartment = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách dự án thành công",
      data: await ProjectService.getAllProjectInDepartment(
        req.query,
        req.params
      ),
    }).send(res);
  };
  trash = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách dự án bị xoá thành công",
      data: await ProjectService.trash(req.query),
    }).send(res);
  };
  detail = async (req, res, next) => {
    new SuccessResponse({
      message: "Thông tin dự án",
      data: await ProjectService.detail(req.params.id),
    }).send(res);
  };
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật dự án thành công",
      data: await ProjectService.update(
        { id: req.params.id, data: req.body },
        req.headers.user
      ),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá thành công dự án",
      data: await ProjectService.delete(req.params.id),
    }).send(res);
  };
  restore = async (req, res, next) => {
    new SuccessResponse({
      message: "Khôi phục thành công dự án",
      data: await ProjectService.restore(req.params.id),
    }).send(res);
  };
  uploadFileFromLocal = async (req, res, next) => {
    const { file } = req;
    if (!file) {
      throw new BadRequestError("File is missing");
    }
    new SuccessResponse({
      message: "Tải file lên thành công",
      data: await ProjectService.uploadFile(req.params.id, file),
    }).send(res);
  };
  getFileImage = async (req, res, next) => {
    new SuccessResponse({
      message: "lấy ảnh file thành công",
      data: await ProjectService.getFileImage(req.body),
    }).send(res);
  };
  getFile = async (req, res, next) => {
    new SuccessResponse({
      message: "lấy file về thành công",
      data: await ProjectService.getFile(req.body),
    }).send(res);
  };
  deleteFile = async (req, res, next) => {
    new SuccessResponse({
      message: "xoá file thành công",
      data: await ProjectService.deleteFile(req.params.id, req.body),
    }).send(res);
  };
}

module.exports = new ProjectController();
