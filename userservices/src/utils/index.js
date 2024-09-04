"use strict";
const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};
const convertObjectToArray = (obj) => {
  return Object.keys(obj).map((key) => obj[key]);
};
const replacePlaceholder = (template, params) => {
  Object.keys(params).forEach((k) => {
    const placeholder = `{{${k}}}`; // Verify key
    template = template.replace(new RegExp(placeholder, "g"), params[k]);
  });
  return template;
};
const genAvatarColor = () => {
  const result = Math.floor(Math.random() * 3);
  switch (result) {
    case 0:
      return "#f56a00";
    case 1:
      return "#87d068";
    case 2:
      return "#1677ff";
  }
};
const removeAccents = (str) => {
  return str
    .normalize("NFD") // Tách ký tự và dấu
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu
    .replace(/đ/g, "d") // Thay đ thành d
    .replace(/Đ/g, "D"); // Thay Đ thành D
};
module.exports = {
  getInfoData,
  replacePlaceholder,
  convertObjectToArray,
  genAvatarColor,
  removeAccents,
};
