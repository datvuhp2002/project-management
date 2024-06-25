"use strict";

const UploadService = require("../services/upload.services");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const {
  uploadImageFromUrl,
  uploadAvartarFromLocal,
  uploadImageFromLocalFiles,
  uploadFile,
} = require("../services/upload.services");
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
  // 2. Upload file avatar from local
  uploadAvartarFromLocal = async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) {
        throw new BadRequestError("File is missing");
      }
      const result = await uploadAvartarFromLocal(file.path, req.headers.user);
      new SuccessResponse({
        message: "Tải ảnh đại diện lên thành công",
        data: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // 3. Upload images from local file
  uploadImageFromLocalFiles = async (req, res, next) => {
    try {
      const { files } = req;
      if (!files || !files.length) {
        throw new BadRequestError("Files are missing");
      }
      const result = await uploadImageFromLocalFiles(files, req.headers.user);
      new SuccessResponse({
        message: "Tải lên nhiều ảnh thành công",
        data: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  // 4. Upload file
  uploadFile = async (req, res, next) => {
    try {
      const { path, filename } = req.body;
      const projectId = req.params.projectId;

      if (!path || !filename) {
        throw new BadRequestError("Path và filename không được để trống");
      }

      const result = await uploadFile(projectId, { path, filename });
      new SuccessResponse({
        message: "Tải tệp lên dự án thành công",
        data: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // getAvatar = async (req, res, next) => {
  //   new SuccessResponse({
  //     message: "Lấy ảnh đại diện về thành công",
  //     data: await UserService.getAvatar(req.body.avatar),
  //   }).send(res);
  // };
  // deleteAvatarInCloud = async (req, res, next) => {
  //   new SuccessResponse({
  //     message: "Xóa ảnh đại diện thành công",
  //     data: await UserService.deleteAvatarInCloud(
  //       req.body.avatar,
  //       req.headers.user
  //     ),
  //   }).send(res);
  // };
}

module.exports = new UserController();
