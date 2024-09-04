"use strict";
const UserServices = require("./user.service");
const grpc = require("@grpc/grpc-js");

async function GetUser(call, callback) {
  const { user_id } = call.request;
  try {
    const user = await UserServices.detail(user_id);
    const responseData = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      name: user.name,
      avatar_color: user.avatar_color,
      department_id: user.department_id,
      role_name: user.role.name,
    };
    if (responseData) {
      callback(null, responseData);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "User not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}
async function GetDetailManagerAndTotalStaffInDepartment(call, callback) {
  const { department_id, manager_id } = call.request;
  try {
    const result = await UserServices.getDetailManagerAndTotalStaffInDepartment(
      {
        department_id,
        manager_id,
      }
    );
    if (result) {
      callback(null, result);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "User not found",
      });
    }
  } catch (error) {
    console.error("Error in getDetailManagerAndTotalStaffInDepartment:", error);
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}

module.exports = { GetUser, GetDetailManagerAndTotalStaffInDepartment };
