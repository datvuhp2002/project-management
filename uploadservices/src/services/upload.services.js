"use strict";

const { result } = require("lodash");
const cloudinary = require("../configs/cloudinary.config");
const { BadRequestError } = require("../core/error.response");
const { publicDecrypt } = require("crypto");

const getfile = async (filename) => {
  try {
    const result = await cloudinary.url(filename, { resource_type: "raw" });
    return result;
  } catch (error) {
    console.error(error);
  }
};
const getAvatar = async ({ avatar }) => {
  console.log(avatar);
  // Return colors in the response
  const options = {
    format: "jpg",
  };
  try {
    const result = await cloudinary.url(avatar, options);
    console.log(result);
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
  getfile,
  getFileImage,
  getAvatar,
};
