"use strict";
const _ = require("lodash");
const axios = require("axios");
const { BadRequestError } = require("../core/error.response");
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};
const getUserByUserPropertyIds = async (user_property_ids) => {
  console.log(user_property_ids);
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffByUserProperty`,
      user_property_ids,
      {
        responseType: "json",
      }
    );
    if (!response.data) {
      throw new BadRequestError("Người dùng không tồn tại");
    }
    return response.data.data;
  } catch (error) {
    throw new BadRequestError("Đã xảy ra lỗi, hãy thử lại sau");
  }
};

module.exports = {
  getUserByUserPropertyIds,
  getInfoData,
};
