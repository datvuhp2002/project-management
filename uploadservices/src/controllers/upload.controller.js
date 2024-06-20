"use strict";

const UserService = require("../services/user.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const { uploadImageFromUrl } = require("../services/upload.services");
const { BadRequestError } = require("../core/error.response");
const cloudinary = require("../configs/cloudinary.config");
const { getInfoData } = require("../utils/index");

class UserController {
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
