"use strict";

const AccessService = require("../services/access.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      message: "Đăng nhập thành công",
      data: await AccessService.login(req.body),
    }).send(res);
  };

  reportForDepartment = async (req, res, next) => {
    new SuccessResponse({
      message: "Báo cáo thành công",
      data: await AccessService.reportForDepartment(req.params.id),
    }).send(res);
  };

  reportForProject = async (req, res, next) => {
    new SuccessResponse({
      message: "Báo cáo thành công",
      data: await AccessService.reportForProject(req.params.id),
    }).send(res);
  };

  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Get Token success",
      data: await AccessService.handleRefreshToken({
        user: req.user,
        refreshToken: req.refreshToken,
      }),
    }).send(res);
  };
}
module.exports = new AccessController();
