"use strict";
const ProjectServices = require("./project.service");
const grpc = require("@grpc/grpc-js");

async function GetProject(call, callback) {
  const { project_id } = call.request;
  try {
    const project = await ProjectServices.detail(project_id);
    if (project) {
      callback(null, project);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Project not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}
async function GetListProjectInDepartment(call, callback) {
  const { department_id } = call.request;
  try {
    const projectIds = await ProjectServices.getAllProjectIdsInDepartment(
      department_id
    );
    const response = {
      ids: projectIds,
    };
    if (projectIds) {
      callback(null, response);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Project not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error,
    });
  }
}
module.exports = { GetProject, GetListProjectInDepartment };
