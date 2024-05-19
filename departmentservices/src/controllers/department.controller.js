"use strict";

const DepartmentService = require("../services/department.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class DepartmentController {
  create = async (req, res, next) => {
    new CREATED({
      message: "Tạo phòng ban mới thành công",
      data: await DepartmentService.create(req.body, req.headers.user),
    }).send(res);
  };
  /**
   * @param {items_per_page}
   * @param {page}
   * @param {search}
   * @param {nextPage}
   * @param {previousPage}
   */
  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy tất cả phòng ban thành công",
      data: await DepartmentService.getAll(req.query),
    }).send(res);
  };

  /**
   * @param {items_per_page}
   * @param {page}
   * @param {search}
   * @param {nextPage}
   * @param {previousPage}
   */
  trash = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy tất cả phòng ban đã bị xoá thành công",
      data: await DepartmentService.trash(req.query),
    }).send(res);
  };
  detail = async (req, res, next) => {
    new SuccessResponse({
      message: "Get detail Ok",
      data: await DepartmentService.detail(req.params.id),
    }).send(res);
  };
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật phòng ban thành công",
      data: await DepartmentService.update({
        id: req.params.id,
        data: req.body,
        userId: req.headers.user,
      }),
    }).send(res);
  };
  updateForManager = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật phòng ban thành công",
      data: await DepartmentService.updateForManager({
        id: req.params.id,
        data: req.body,
        userId: req.headers.user,
      }),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá thành công phòng ban",
      data: await DepartmentService.delete(req.params.id),
    }).send(res);
  };
  restore = async (req, res, next) => {
    new SuccessResponse({
      message: "Khôi phục thành công phòng ban",
      data: await DepartmentService.restore(req.params.id),
    }).send(res);
  };
}

module.exports = new DepartmentController();
