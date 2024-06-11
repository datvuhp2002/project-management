"use strict";

const RoleService = require("../services/role.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class RoleController {
  create = async (req, res, next) => {
    new CREATED({
      message: "created role OK",
      data: await RoleService.create(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Get All Ok",
      data: await RoleService.getAll(),
    }).send(res);
  };
  detail = async (req, res, next) => {
    new SuccessResponse({
      message: "Get All Ok",
      data: await RoleService.findById(req.body),
    }).send(res);
  };
}

module.exports = new RoleController();
