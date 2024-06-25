const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log("Data from server:", responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway";
  res.send(responseData);
};
const uploadServicesRoutes = {
  "/upload-avatar-from-local": {
    target: `${process.env.UPLOAD_SERVICES_REQUEST_URL}/upload-avatar-from-local`,
    authRequired: true,
    permissions: null,
  },
  "/get-file": {
    target: `${process.env.UPLOAD_SERVICES_REQUEST_URL}/get-file`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = uploadServicesRoutes;
