"use strict";
const axios = require("axios");
class RequestData {
  static async fetchData(url, method = "GET", data = null) {
    try {
      const options = {
        method,
        url,
        headers: {
          "Content-Type": "application/json",
        },
        data,
      };
      const response = await axios(options);
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error.message);
      throw error;
    }
  }
}
module.exports = RequestData;
