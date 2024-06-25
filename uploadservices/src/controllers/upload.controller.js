"use strict";

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const { BadRequestError } = require("../core/error.response");
const cloudinary = require("../configs/cloudinary.config");
const { getInfoData } = require("../utils/index");
const { runProducer } = require("../message_queue/producer");
const {
  userProducerTopic,
} = require("../configs/kafkaUserTopic/producer/user.producer.topic.config");
const { getfile } = require("../services/upload.services");
class UserController {
  // 2. Upload file avatar from local
  uploadAvartarFromLocal = async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) {
        throw new BadRequestError("File is missing");
      }
      await runProducer(userProducerTopic.uploadAvartarFromLocal, {
        file: file.filename,
        user_id: req.headers.user,
      });
      new SuccessResponse({
        message: "Tải ảnh đại diện lên thành công",
        data: file.path,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  getFile = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy file về thành công",
      data: await getfile(req.body.file),
    }).send(res);
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
