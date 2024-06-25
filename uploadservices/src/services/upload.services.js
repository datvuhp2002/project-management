"use strict";

const { result } = require("lodash");
const cloudinary = require("../configs/cloudinary.config");
const { BadRequestError } = require("../core/error.response");
const { publicDecrypt } = require("crypto");

const getfile = async (filename) => {
  try {
    const result = await cloudinary.url(filename);
    return result;
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  getfile,
};
