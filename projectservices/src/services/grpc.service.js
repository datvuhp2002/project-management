"use strict";
const ProjectServices = require("./project.service");
const grpc = require("@grpc/grpc-js");

async function GetProject(call, callback) {
  const { project_id } = call.request;
  console.log("Project ID:::", project_id);
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
module.exports = { GetProject };
