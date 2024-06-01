"use strict";
const gateWayRequestUserServices = require("../services/gateway.user.services");
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class gatewayRequestUserServicesController {
  findByEmail = async (req, res, next) => {
    new SuccessResponse({
      message: "vui lòng kiểm tra email của bạn",
      data: await gateWayRequestUserServices.findByEmail(req.body),
    }).send(res);
  };
}
module.exports = new gatewayRequestUserServicesController();
