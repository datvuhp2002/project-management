"use strict";

const cloudinary = require("../configs/cloudinary.config");
const { runProducer } = require("../message_queue/producer");
const { taskProducerTopic } = require("../configs/kafkaTaskTopic");
const { projectProducerTopic } = require("../configs/kafkaProjectTopic");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const getFile = async (filename) => {
  try {
    const extension = filename.split(".").pop().toLowerCase();

    if (extension === "pdf") {
      return await getFileImage({ filename });
    }

    const resource_type = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
      extension
    )
      ? "image"
      : "raw";

    const result = await cloudinary.api.resource(filename, {
      resource_type,
    });

    if (result) return result.url;
    throw new BadRequestError("File not found");
  } catch (error) {
    console.error(error);
  }
};
const getFileImage = async ({ filename }) => {
  const options = {
    format: "jpg",
    quality: "auto",
  };
  try {
    const result = await cloudinary.url(filename, options);
    if (result) return result;
    throw new BadRequestError("File not found");
  } catch (error) {
    console.error(error);
  }
};
const getAvatar = async ({ avatar }) => {
  const options = {
    format: "jpg",
  };
  try {
    const result = await cloudinary.url(avatar, options);
    return result;
  } catch (error) {
    console.error(error);
  }
};

const deleteFileForTask = async (task_id, filename) => {
  if (!filename) throw new BadRequestError("Invalid filename");
  await deleteFile(filename);
  await runProducer(taskProducerTopic.deleteTaskFileInCloud, {
    task_id: task_id,
    filename: filename,
  });
  return true;
};
const deleteFileForProject = async (project_id, filename) => {
  if (!filename) throw new BadRequestError("Invalid filename");
  await deleteFile(filename);
  await runProducer(projectProducerTopic.deleteProjectFileInCloud, {
    project_id: project_id,
    filename: filename,
  });
  return true;
};
const deleteFile = async (filename) => {
  try {
    await cloudinary.uploader.destroy(filename);
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  getFile,
  getFileImage,
  getAvatar,
  deleteFile,
  deleteFileForTask,
  deleteFileForProject,
};
