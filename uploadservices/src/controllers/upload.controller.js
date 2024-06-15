"use strict";
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const { uploadImageFromUrl } = require("../services/upload.services");
const { BadRequestError } = require("../core/error.response");
const cloudinary = require("../configs/cloudinary.config");
class UploadController {
  uploadImageFromUrl = async (req, res, next) => {
    new SuccessResponse({
      message: "Tải avatar thành công",
      data: await uploadImageFromUrl(req.body, req.headers.user),
    }).send(res);
  };
  uploadAvatarFromLocal = async (req, res, next) => {
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
  uploadAvatarFromLocalFiles = async (req, res, next) => {
    const { files } = req;
    if (!files || files.length === 0) {
      throw new BadRequestError("Files are missing");
    }
    const uploadedUrls = await uploadAvatarFromLocalFiles(
      files,
      req.headers.user
    );
    if (!uploadedUrls) {
      throw new BadRequestError("Upload avatar không thành công");
    }
    new SuccessResponse({
      message: "Tải ảnh đại diện lên thành công",
      data: uploadedUrls,
    }).send(res);
  };

  uploadFile = async (req, res, next) => {
    const { file } = req;
    if (!file) {
      throw new BadRequestError("File is missing");
    }
    const { project_id } = req.body;
    const result = await uploadFile(project_id, file);
    if (!result) {
      throw new BadRequestError("Upload file không thành công");
    }
    new SuccessResponse({
      message: "Tải file lên thành công",
      data: { success: true },
    }).send(res);
  };
}

module.exports = new UploadController();
