"use strict";
const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const replacePlaceholder = (template, params) => {
  Object.keys(params).forEach((k) => {
    const placeholder = `{{${k}}}`; // Verify key
    template = template.replace(new RegExp(placeholder, "g"), params[k]);
  });
  return template;
};
module.exports = {
  getInfoData,
  replacePlaceholder,
};
