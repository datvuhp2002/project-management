"use strict";
const _ = require("lodash");
const { BadRequestError } = require("../core/error.response");
const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const convertObjectToArray = (obj) => {
  return Object.keys(obj).map((key) => obj[key]);
};
module.exports = {
  getInfoData,
  convertObjectToArray,
};
