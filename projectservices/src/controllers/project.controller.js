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
  getAllInfoProjectInDepartment = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách dự án thành công",
      data: await ProjectService.getAllInfoProjectInDepartment(
        req.query,
        req.params
      ),
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
  getAllUserProjectInDepartment = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách dự án thành công",
      data: await ProjectService.getAllUserProjectInDepartment(
        req.query,
        req.params.id,

        req.headers.user
      ),
    }).send(res);
  };
  getAllUserProject = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách dự án thành công",
      data: await ProjectService.getUserProject(req.query, req.headers.user),
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
      data: await ProjectService.delete(req.params.id, req.headers.user),
    }).send(res);
  };
  forceDelete = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá thành công dự án",
      data: await ProjectService.forceDelete(req.params.id),
    }).send(res);
  };

  restore = async (req, res, next) => {
    new SuccessResponse({
      message: "Khôi phục thành công dự án",
      data: await ProjectService.restore(req.params.id),
    }).send(res);
  };
}
module.exports = new ProjectController();
