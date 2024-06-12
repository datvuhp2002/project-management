"use strict";

const UserService = require("../services/user.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const { uploadImageFromUrl } = require("../services/upload.services");
const { BadRequestError } = require("../core/error.response");
const cloudinary = require("../configs/cloudinary.config");
const { getInfoData } = require("../utils/index");

class UserController {
  forgetPassword = async (req, res, next) => {
    new SuccessResponse({
      message: "Vui lòng kiểm tra email của bạn",
      data: await UserService.forgetPassword({ email: req.body.email }),
    }).send(res);
  };
  changePassword = async (req, res, next) => {
    new SuccessResponse({
      message: "Thay đổi mật khẩu thành công",
      data: await UserService.changePassword(req.body),
    }).send(res);
  };
  create = async (req, res, next) => {
    new CREATED({
      message: "Tạo nhân viên mới thành công",
      data: await UserService.create(req.body, req.headers.user),
    }).send(res);
  };
  findByEmail = async (req, res, next) => {
    new SuccessResponse({
      message: "Tìm email thành công",
      data: await UserService.findByEmail(req.params.email),
    }).send(res);
  };
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
      message: "Lấy ra danh sách người dùng thành công",
      data: await UserService.getAll(req.query),
    }).send(res);
  };
  getListOfStaffDoNotHaveDepartment = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh nhân viên chưa có phòng ban thành công",
      data: await UserService.getListOfStaffDoNotHaveDepartment(req.query),
    }).send(res);
  };
  getAllStaffInDepartment = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách người dùng thành công",
      data: await UserService.getAllStaffInDepartment(req.query, req.body),
    }).send(res);
  };
  getAllStaffInProject = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách người dùng thành công",
      data: await UserService.getAllStaffInProject(req.query, req.params.id),
    }).send(res);
  };
  getAllStaffInDepartmentForAdmin = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ra danh sách người dùng thành công",
      data: await UserService.getAllStaffInDepartmentForAdmin(
        req.query,
        req.params.id
      ),
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
      message: "Lấy ra danh sách người dùng bị xoá thành công",
      data: await UserService.trash(req.query),
    }).send(res);
  };
  detail = async (req, res, next) => {
    new SuccessResponse({
      message: "Thông tin người dùng",
      data: await UserService.detail(req.headers.user),
    }).send(res);
  };

  information = async (req, res, next) => {
    new SuccessResponse({
      message: "Thông tin người dùng",
      data: await UserService.detail(req.params.id),
    }).send(res);
  };
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật nhân viên thành công",
      data: await UserService.update({ id: req.headers.user, data: req.body }),
    }).send(res);
  };
  updateStaff = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật nhân viên thành công",
      data: await UserService.update({
        id: req.params.id,
        data: req.body,
      }),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá thành công nhân viên",
      data: await UserService.delete(req.params.id),
    }).send(res);
  };
  restore = async (req, res, next) => {
    new SuccessResponse({
      message: "Khôi phục thành công nhân viên",
      data: await UserService.restore(req.params.id),
    }).send(res);
  };
  /**
   * @param {ids} query
   * @param {:id} params departmentId
   */
  addUserIntoDepartment = async (req, res, next) => {
    new SuccessResponse({
      message: "Thêm thành công nhân viên vào phòng ban",
      data: await UserService.addUserIntoDepartment(req.body, req.params.id),
    }).send(res);
  };
  removeStaffFromDepartment = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá thành công nhân viên ra khỏi phòng ban",
      data: await UserService.removeStaffFromDepartment(
        req.body,
        req.params.id
      ),
    }).send(res);
  };
  uploadImageFromUrl = async (req, res, next) => {
    new SuccessResponse({
      message: "Tải avatar thành công",
      data: await uploadImageFromUrl(req.body, req.headers.user),
    }).send(res);
  };
  uploadFileAvatarFromLocal = async (req, res, next) => {
    const { file } = req;
    if (!file) {
      throw new BadRequestError("File is missing");
    }
    new SuccessResponse({
      message: "Tải ảnh đại diện lên thành công",
      data: await UserService.update({
        id: req.headers.user,
        data: { avatar: file.filename },
      }),
    }).send(res);
  };
  getAvatar = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ảnh đại diện về thành công",
      data: await UserService.getAvatar(req.body.avatar),
    }).send(res);
  };
  deleteAvatarInCloud = async (req, res, next) => {
    new SuccessResponse({
      message: "Xóa ảnh đại diện thành công",
      data: await UserService.deleteAvatarInCloud(
        req.body.avatar,
        req.headers.user
      ),
    }).send(res);
  };
}

module.exports = new UserController();
