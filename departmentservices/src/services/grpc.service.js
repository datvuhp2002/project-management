"use strict";
const DepartmentService = require("./department.service");
const grpc = require("@grpc/grpc-js");

async function GetDepartment(call, callback) {
  const { department_id } = call.request;
  try {
    const department = await DepartmentService.infoDepartment(department_id);
    if (department) {
      callback(null, department);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Department not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}
module.exports = { GetDepartment };
