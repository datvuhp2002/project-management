"use strict";
const prisma = require("../prisma");
const { htmlEmailToken } = require("../utils/temp.html");
const { createUserTemplate } = require("../utils/create_user.html");
const newTemplate = async ({ name, html }) => {
  // 1. check if temp is exists
  // 2. create new temp
  const newTemp = await prisma.template.create({
    data: {
      name,
      html: createUserTemplate(),
    },
  });
};
const getTemplate = async ({ name }) => {
  return await prisma.template.findUnique({ where: { name } });
};

module.exports = {
  newTemplate,
  getTemplate,
};
