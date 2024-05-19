"use strict";

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const ClientService = require("../services/client.service");
const { getInfoData } = require("../utils");
class ClientController {
  /**
   *
   * @body {fullname} req
   * @body {email} req
   * @body {avatar} req
   * @body {address} req
   * @body {phone} req
   */
  create = async (req, res, next) => {
    new CREATED({
      message: "Tạo một khách hàng mới thành công",
      data: await ClientService.create(req.body, req.headers.user),
    }).send(res);
  };
  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Danh sách khách hàng",
      data: await ClientService.getAll(req.query),
    }).send(res);
  };
  getAllClientFromProject = async (req, res, next) => {
    new SuccessResponse({
      message: "Danh sách khách hàng",
      data: await ClientService.getAllClientFromProject(
        req.query,
        req.params.id
      ),
    }).send(res);
  };
  trash = async (req, res, next) => {
    new SuccessResponse({
      message: "Danh sách khách hàng đã bị xoá",
      data: await ClientService.trash(req.query),
    }).send(res);
  };
  detail = async (req, res, next) => {
    new SuccessResponse({
      message: "Chi tiết khách hàng",
      data: await ClientService.findById(req.body),
    }).send(res);
  };
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Cập nhật khách hàng thành công",
      data: await ClientService.update(
        req.params.id,
        req.body,
        req.headers.user
      ),
    }).send(res);
  };
  uploadFileAvatarFromLocal = async (req, res, next) => {
    const { file } = req;
    if (!file) {
      throw new BadRequestError("File is missing");
    }
    new SuccessResponse({
      message: "Tải ảnh đại diện lên thành công",
      data: getInfoData({
        fields: ["path", "filename"],
        object: file,
      }),
    }).send(res);
  };
  getAvatar = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy ảnh đại diện về thành công",
      data: await ClientService.getAvatar(req.body.avatar),
    }).send(res);
  };
  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Xoá khách hàng thành công",
      data: await ClientService.delete(req.params.id),
    }).send(res);
  };
  restore = async (req, res, next) => {
    new SuccessResponse({
      message: "Khôi phục khách hàng thành công",
      data: await ClientService.restore(req.params.id),
    }).send(res);
  };
}

module.exports = new ClientController();
