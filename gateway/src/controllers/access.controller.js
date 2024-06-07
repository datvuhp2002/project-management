"use strict";
const AccessService = require("../services/access.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class AccessController {
  login = async (req, res, next) => {
    try {
      // Gọi hàm login từ AccessService để lấy tokens và role
      const { tokens, role } = await AccessService.login(req.body);
      // Lưu trữ token vào cookie
      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // chỉ sử dụng https trong môi trường production
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 ngày
      });
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
      });
      // Tạo đối tượng sendDate
      const sendDate = Object.assign(
        {
          requestId: req.requestId,
        },
        req.body
      );
      // Gọi hàm login từ AccessService với sendDate
      const loginData = await AccessService.login(sendDate);
      // Gửi phản hồi thành công
      new SuccessResponse({
        message: "Đăng nhập thành công",
        data: {
          role,
          loginData,
        },
      }).send(res);
    } catch (error) {
      next(error);
    }
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
