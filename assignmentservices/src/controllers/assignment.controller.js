"use strict";

const AssignmentService = require("../services/assignment.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class AssignmentController {
  create = async (req, res, next) => {
    new CREATED({
      message: "Tạo phân công mới thành công",
      data: await AssignmentService.create(req.body, req.headers.user),
    }).send(res);
  };
  /**
   * @param {items_per_page}
   * @param {page}
   * @param {nextPage}
   * @param {previousPage}
   */
  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy tất cả phân công thành công",
      data: await AssignmentService.getAll(req.query),
    }).send(res);
  };
  /**
   * @query {items_per_page}
   * @query {page}
   * @query {nextPage}
   * @query {previousPage}
   * @query {target} default user
   * @query {status} is done or not (true || false),
   * @query {isAssignment} check task is assignment or not (true || false)
   * @query {page},
   * @query search,
   */
  getAllAssignment = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy tất cả phân công",
      data: await AssignmentService.getAllAssignment(req.query, req.params.id),
    }).send(res);
  };
  /**
   * @param {status} is done or not,
   * @param {page},
   * @param search,
   */
  getAllAssignmentForUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy tất cả phân công của nhân viên thành công",
      data: await AssignmentService.getAllAssignmentForUser(
        req.query,
        req.params.id
      ),
    }).send(res);
  };
  /**
   * @param {isAssignment} check task is assignment or not
   * @param {status} is done or not,
   * @param {page},
   * @param search,
   */
  getAllAssignmentForProject = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy tất cả phân công của dự án thành công",
      data: await AssignmentService.getAllAssignmentForProject(
        req.query,
        req.params.id
      ),
    }).send(res);
  };
  /**
   *
   * @param {isAssignment} check task is assignment or not
   * @param {status} is done or not,
   * @param {page},
   * @param search,
   */
  getAllAssignmentForTask = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy danh sách nhiệm vụ thành công",
      data: await AssignmentService.getAllAssignmentForTask(
        req.query,
        req.params.id
      ),
    }).send(res);
  };
  getAllUserFromProject = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy tất cả thuộc tính nhân viên trong dự án thành công",
      data: await AssignmentService.getAllUserFromProject(req.params.id),
    }).send(res);
  };

  getAllTaskFromProject = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy tất cả thuộc tính nhiệm vụ trong dự án thành công",
      data: await AssignmentService.getAllTaskFromProject(req.params.id),
    }).send(res);
  };
  removeStaffFromProject = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá nhân viên trong dự án thành công",
      data: await AssignmentService.removeStaffFromProject(
        req.params.id,
        req.body.ids
      ),
    }).send(res);
  };
  /**
   * @param {items_per_page}
   * @param {page}
   * @param {nextPage}
   * @param {previousPage}
   */
  trash = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy tất cả phân công đã bị xoá thành công",
      data: await AssignmentService.trash(req.query),
    }).send(res);
  };
  detail = async (req, res, next) => {
    new SuccessResponse({
      message: "Chi tiết nhiệm vụ",
      data: await AssignmentService.detail(req.params.id),
    }).send(res);
  };
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật phân công thành công",
      data: await AssignmentService.update({
        id: req.params.id,
        data: req.body,
      }),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá thành công phân công",
      data: await AssignmentService.delete(req.params.id),
    }).send(res);
  };
  restore = async (req, res, next) => {
    new SuccessResponse({
      message: "Khôi phục thành công phân công",
      data: await AssignmentService.restore(req.params.id),
    }).send(res);
  };
}

module.exports = new AssignmentController();
