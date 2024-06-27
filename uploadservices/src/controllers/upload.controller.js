"use strict";

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const { BadRequestError } = require("../core/error.response");
const cloudinary = require("../configs/cloudinary.config");
const { getInfoData } = require("../utils/index");
const { runProducer } = require("../message_queue/producer");
const {
  userProducerTopic,
} = require("../configs/kafkaUserTopic/producer/user.producer.topic.config");
const {
  projectProducerTopic,
} = require("../configs/kafkaProjectTopic/producer/project.producer.topic.config");
const { getfile } = require("../services/upload.services");
class UserController {
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
        message: "Tải ảnh đại diện cho người dùng thành công",
        data: file.path,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  uploadAvartarClient = async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) {
        throw new BadRequestError("File is missing");
      }
      await runProducer(projectProducerTopic.uploadAvartarClient, {
        file: file.filename,
        client_id: req.params.clientId,
      });
      new SuccessResponse({
        message: "Tải ảnh đại diện cho khách hàng thành công",
        data: file.path,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  uploadFileForProject = async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) {
        throw new BadRequestError("Path và filename không được để trống");
      }
      const { path, filename } = file;
      const projectId = req.params.projectId;
      await runProducer(projectProducerTopic.uploadFileForProject, {
        file: filename,
        project_id: projectId,
      });
      new SuccessResponse({
        message: "Tải tệp file dự án thành công",
        data: {
          path,
          filename,
        },
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  uploadFileForTask = async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) {
        throw new BadRequestError("Path và filename không được để trống");
      }
      const { path, filename } = file;
      const taskId = req.params.taskId;
      await runProducer(projectProducerTopic.uploadFile, {
        file: filename,
        task_id: taskId,
      });
      new SuccessResponse({
        message: "Tải file nhiệm vụ thành công",
        data: {
          path,
          filename,
        },
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
