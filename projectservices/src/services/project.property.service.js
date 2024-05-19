"use strict";
const prisma = require("../prisma");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
class ProjectPropertyService {
  static create = async (data) => {
    const newProjectProperty = await prisma.projectProperty.create({
      data: { ...data },
    });
    if (newProjectProperty) {
      return {
        code: 201,
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
  static update = async (data, project_id) => {
    return await prisma.projectProperty.update({
      where: { project_id },
      data: {
        ...data,
      },
    });
  };
  static delete = async (project_id) => {
    return await prisma.projectProperty.update({
      where: { project_id },
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
  };
  static restore = async (project_id) => {
    return await prisma.projectProperty.update({
      where: { project_id },
      data: { deletedMark: false, deletedAt: null },
    });
  };
  static getAll = async () => {
    return await prisma.projectProperty.findMany();
  };
}
module.exports = ProjectPropertyService;
