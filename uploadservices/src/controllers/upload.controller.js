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
const {
  taskProducerTopic,
} = require("../configs/kafkaTaskTopic/producer/task.producer.topic.config");
const {
  getfile,
  getFileImage,
  getAvatar,
} = require("../services/upload.services");
class UserController {
  uploadAvartarFromLocal = async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) {
        throw new BadRequestError("File is missing");
      }
      try {
        await runProducer(userProducerTopic.uploadAvartarFromLocal, {
          file: file.filename,
          user_id: req.headers.user,
        });
      } catch (err) {
        console.log(err.message);
      }
      new SuccessResponse({
        message: "Tải ảnh đại diện cho người dùng thành công",
        data: file.path,
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
      console.log(req.params.id);
      await runProducer(taskProducerTopic.uploadFileForTask, {
        file: file.filename,
        task_id: req.params.id,
        modifiedBy: req.headers.user,
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

  uploadAvartarClient = async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) {
        throw new BadRequestError("File is missing");
      }
      await runProducer(projectProducerTopic.uploadAvartarClient, {
        file: file.filename,
        client_id: req.params.id,
        modifiedBy: req.headers.user,
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
      await runProducer(projectProducerTopic.uploadFileForProject, {
        file: filename,
        project_id: req.params.id,
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

  getFile = async (req, res, next) => {
    new SuccessResponse({
      message: "Lấy file về thành công",
      data: await getfile(req.body.file),
    }).send(res);
  };
  getFileImage = async (req, res, next) => {
    new SuccessResponse({
      message: "lấy ảnh file thành công",
      data: await getFileImage(req.body),
    }).send(res);
  };

  getAvatar = async (req, res, next) => {
    new SuccessResponse({
      message: "lấy ảnh file thành công",
      data: await getAvatar(req.body),
    }).send(res);
  };
}

module.exports = new UserController();
