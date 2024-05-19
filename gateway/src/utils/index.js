"use strict";
const _ = require("lodash");
const axios = require("axios");
const { BadRequestError } = require("../core/error.response");
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};
const getUserByEmail = async (email) => {
  let foundUser = null;
  let role = null;
  await axios
    .get(`${process.env.REQUEST_URL}/users/findByEmail/${email}`, {
      responseType: "json",
    })
    .then((res) => {
      if (!res.data) throw new BadRequestError("Người dùng không tồn tại");
      foundUser = res.data.data;
      role = res.data.data.UserProperty.role;
    })
    .catch((err) => {
      throw new BadRequestError("Đã xảy ra lỗi, hãy thử lại sau");
    });
  return {
    user: foundUser,
    role: role,
  };
};

module.exports = {
  getInfoData,
  getUserByEmail,
};
