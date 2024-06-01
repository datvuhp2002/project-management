"use strict";
import requestApi from "../utils/requestData";
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
    async create(dataUser, createdBy) {
      try {
        const requestBody = {
          ...dataUser,
          createdBy
        };
        const response = await requestApi('/create', 'POST', requestBody);
        return response.data;
      } catch (error) {
        console.error("Error in gateWayRequestUserServices.create:", error);
        throw error;
      }
    }
    async forgetPassword(email, captcha) {
      try {
          const requestBody = {
              email,
              captcha
          };
          const response = await requestApi('/forgetPassword', 'POST', requestBody);
          return response.data;
      } catch (error) {
          console.error("Error in gateWayRequestUserServices.forgetPassword:", error);
          throw error;
      }
  }

  async changePassword(password, email) {
      try {
          const requestBody = {
              password,
              email
          };
          const response = await requestApi('/changePassword', 'POST', requestBody);
          return response.data;
      } catch (error) {
          console.error("Error in gateWayRequestUserServices.changePassword:", error);
          throw error;
      }
  }

  async findUserByRole(role) {
      try {
          const response = await requestApi(`/findUserByRole/${role}`, "GET");
          return response.data;
      } catch (error) {
          console.error("Error in gateWayRequestUserServices.findUserByRole:", error);
          throw error;
      }
  }

  async findUserPropertyByRole(role) {
      try {
          const response = await requestApi(`/findUserPropertyByRole/${role}`, "GET");
          return response.data;
      } catch (error) {
          console.error("Error in gateWayRequestUserServices.findUserPropertyByRole:", error);
          throw error;
      }
  }

  async addUserIntoDepartment(list_user_ids, department_id) {
      try {
          const requestBody = {
              list_user_ids,
              department_id
          };
          const response = await requestApi('/addUserIntoDepartment', 'POST', requestBody);
          return response.data;
      } catch (error) {
          console.error("Error in gateWayRequestUserServices.addUserIntoDepartment:", error);
          throw error;
      }
  }

  async removeStaffFromDepartment(list_user_ids, department_id) {
      try {
          const requestBody = {
              list_user_ids,
              department_id
          };
          const response = await requestApi('/removeStaffFromDepartment', 'POST', requestBody);
          return response.data;
      } catch (error) {
          console.error("Error in gateWayRequestUserServices.removeStaffFromDepartment:", error);
          throw error;
      }
  }

  async getAllStaffInDepartment(params) {
      try {
          const response = await requestApi(`/getAllStaffInDepartment`, "GET", params);
          return response.data;
      } catch (error) {
          console.error("Error in gateWayRequestUserServices.getAllStaffInDepartment:", error);
          throw error;
      }
  }
  async getAllStaffInDepartmentForAdmin(params) {
    try {
        const response = await requestApi(`/getAllStaffInDepartmentForAdmin`, "GET", params);
        return response.data;
    } catch (error) {
        console.error("Error in gateWayRequestUserServices.getAllStaffInDepartmentForAdmin:", error);
        throw error;
    }
}

async getAllStaffByUserProperty(params) {
    try {
        const response = await requestApi(`/getAllStaffByUserProperty`, "GET", params);
        return response.data;
    } catch (error) {
        console.error("Error in gateWayRequestUserServices.getAllStaffByUserProperty:", error);
        throw error;
    }
}

async getStaffInformationByUserProperty(user_property_id) {
    try {
        const response = await requestApi(`/getStaffInformationByUserProperty/${user_property_id}`, "GET");
        return response.data;
    } catch (error) {
        console.error("Error in gateWayRequestUserServices.getStaffInformationByUserProperty:", error);
        throw error;
    }
}

async getAll(params) {
    try {
        const response = await requestApi(`/getAll`, "GET", params);
        return response.data;
    } catch (error) {
        console.error("Error in gateWayRequestUserServices.getAll:", error);
        throw error;
    }
}

async getListOfStaffDoesNotHaveDepartment(params) {
    try {
        const response = await requestApi(`/getListOfStaffDoesNotHaveDepartment`, "GET", params);
        return response.data;
    } catch (error) {
        console.error("Error in gateWayRequestUserServices.getListOfStaffDoesNotHaveDepartment:", error);
        throw error;
    }
}

async getDetailManagerAndTotalStaffInDepartment(params) {
    try {
        const response = await requestApi(`/getDetailManagerAndTotalStaffInDepartment`, "GET", params);
        return response.data;
    } catch (error) {
        console.error("Error in gateWayRequestUserServices.getDetailManagerAndTotalStaffInDepartment:", error);
        throw error;
    }
}
async trash(params) {
  try {
      const response = await requestApi(`/trash`, "GET", params);
      return response.data;
  } catch (error) {
      console.error("Error in gateWayRequestUserServices.trash:", error);
      throw error;
  }
}

async detail(id) {
  try {
      const response = await requestApi(`/detail/${id}`, "GET");
      return response.data;
  } catch (error) {
      console.error("Error in gateWayRequestUserServices.detail:", error);
      throw error;
  }
}

async detailManager(id) {
  try {
      const response = await requestApi(`/detailManager/${id}`, "GET");
      return response.data;
  } catch (error) {
      console.error("Error in gateWayRequestUserServices.detailManager:", error);
      throw error;
  }
}

async update(id, data) {
  try {
      const response = await requestApi(`/update/${id}`, "PUT", data);
      return response.data;
  } catch (error) {
      console.error("Error in gateWayRequestUserServices.update:", error);
      throw error;
  }
}

async delete(user_id) {
  try {
      const response = await requestApi(`/delete/${user_id}`, "DELETE");
      return response.data;
  } catch (error) {
      console.error("Error in gateWayRequestUserServices.delete:", error);
      throw error;
  }
}

async restore(user_id) {
  try {
      const response = await requestApi(`/restore/${user_id}`, "PUT");
      return response.data;
  } catch (error) {
      console.error("Error in gateWayRequestUserServices.restore:", error);
      throw error;
  }
}

async getAvatar(avatar) {
  try {
      const response = await requestApi(`/getAvatar/${avatar}`, "GET");
      return response.data;
  } catch (error) {
      console.error("Error in gateWayRequestUserServices.getAvatar:", error);
      throw error;
  }
}

async deleteAvatarInCloud(avatar, user_id) {
  try {
      const response = await requestApi(`/deleteAvatarInCloud/${avatar}/${user_id}`, "DELETE");
      return response.data;
  } catch (error) {
      console.error("Error in gateWayRequestUserServices.deleteAvatarInCloud:", error);
      throw error;
  }
}

}
module.exports = gateWayRequestUserServices;
