"use strict";
const UserServices = require("./user.service");
const grpc = require("@grpc/grpc-js");

async function GetUser(call, callback) {
  const { user_id } = call.request;
  console.log("User ID:::", user_id);
  try {
    const user = await UserServices.detail(user_id);
    if (user) {
      callback(null, user);
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
  console.log(department_id);
  try {
    const result = await UserServices.getDetailManagerAndTotalStaffInDepartment(
      {
        department_id,
        manager_id,
      }
    );
    console.log("Result:::", result);
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
