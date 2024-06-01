"use strict";
class gateWayRequestUserServices {
    async findByEmail(email) {
        try {
          const response = await requestApi(`/findByEmail/${email}`, "GET");
          return response.data;
        } catch (error) {
          console.error("Error in gateWayRequestUserServices.findByEmail:", error);
          throw error;
        }
    }
}

module.exports = gateWayRequestUserServices;
