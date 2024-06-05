const axios = require("axios");

async function requestApi(endpoint, method, body, responseType = "json", contentType = "application/json", authRequired = false) {
  const headers = {
    Accept: "application/json",
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
  };

  // Nếu yêu cầu cần xác thực, thêm các headers tương ứng
  if (authRequired) {
    // Thêm logic xác thực vào đây (nếu cần)
  }

  // Tạo instance axios với các headers được cấu hình
  const instance = axios.create({ headers });

  try {
    // Gửi yêu cầu đến endpoint được chỉ định với các tham số được cung cấp
    const response = await instance.request({
      method: method,
      url: endpoint,
      data: body,
      responseType: responseType,
    });

    // Trả về phản hồi từ dịch vụ đích
    return response;
  } catch (error) {
    // Nếu có lỗi, ném lỗi để được bắt bởi khối try-catch trong hàm gọi
    throw error;
  }
}

module.exports = requestApi;
