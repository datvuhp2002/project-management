"use strict";

const cloudinary = require("../configs/cloudinary.config");
const { runProducer } = require("../message_queue/producer");
const { taskProducerTopic } = require("../configs/kafkaTaskTopic");
const { projectProducerTopic } = require("../configs/kafkaProjectTopic");
const getFile = async (filename) => {
  try {
    const result = await cloudinary.url(filename, { resource_type: "raw" });
    return result;
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
const getFileImage = async ({ filename }) => {
  const options = {
    format: "jpg",
    quality: "auto",
  };
  try {
    const result = await cloudinary.url(filename, options);
    return result;
  } catch (error) {
    console.error(error);
  }
};
const deleteFileForTask = async (task_id, filename) => {
  await deleteFile(filename);
  await runProducer(taskProducerTopic.deleteTaskFileInCloud, {
    task_id: task_id,
    filename: filename,
  });
  return true;
};
const deleteFileForProject = async (project_id, filename) => {
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
