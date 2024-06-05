"use strict";
const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log('Data from server:', responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway"
  res.send(responseData);
};
const roleRoutes = {
  "/get-all": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/role/getAll`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
    customHandler: customConsoleHandler
  },
};

module.exports = roleRoutes;
