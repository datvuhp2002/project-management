"use strict";

const { result } = require("lodash");
const cloudinary = require("../configs/cloudinary.config");
const { BadRequestError } = require("../core/error.response");
const { publicDecrypt } = require("crypto");

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
module.exports = {
  getFile,
  getFileImage,
  getAvatar,
};
