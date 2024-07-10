"use strict";

const prisma = require("../prisma");
const cloudinary = require("../configs/cloudinary.config");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
} = require("../core/error.response");
const { assignmentProducerTopic } = require("../configs/kafkaAssignmentTopic");
const { uploadProducerTopic } = require("../configs/kafkaUploadTopic");
const {
  getTotalTaskWithStatusFromProjectAndTotalStaff,
  getUser,
  getAllUserProject,
} = require("./grpcClient.services");
class ProjectService {
  static select = {
    project_id: true,
    name: true,
    projectCode: true,
    description: true,
    startAt: true,
    endAt: true,
    turnover: true,
    document: true,
    investor: true,
    createdBy: true,
    modifiedBy: true,
    createdAt: true,
    project_manager_id: true,
    department_id: true,
    client_ownership: true,
  };
  // create a new project
  static create = async (data, modifiedBy) => {
    data.modifiedBy = modifiedBy;
    const newProject = await prisma.project.create({
      data,
    });
    if (!newProject) {
      throw new BadRequestError(
        "Tạo một dự án mới không thành công, vui lòng thử lại"
      );
    }
    return newProject;
  };
  // get all projects
  static getAll = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    let query = [];
    query.push({
      deletedMark: false,
    });
    return await this.queryProject(
      {
        query: query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      true
    );
  };
  static getAllInfoProjectInDepartment = async (
    { items_per_page, page, search, nextPage, previousPage },
    { id }
  ) => {
    let query = [];
    query.push({
      department_id: id,
      deletedMark: false,
    });
    const select = {
      project_id: true,
      name: true,
      projectCode: true,
      description: true,
      project_manager_id: true,
    };
    return await this.queryProject(
      {
        query: query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      false,
      select
    );
  };
  // get all projects in department
  static getAllProjectInDepartment = async (
    { items_per_page, page, search, nextPage, previousPage },
    { id }
  ) => {
    let query = [];
    query.push({
      department_id: id,
      deletedMark: false,
    });
    return await this.queryProject(
      {
        query: query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      true
    );
  };
  static getAllUserProjectInDepartment = async (
    { items_per_page, page, search, nextPage, previousPage },
    department_id,
    user_id
  ) => {
    let query = [];
    query.push({
      department_id,
      deletedMark: false,
    });
    const data = await getAllUserProject(user_id);
    if (data.length === 0) return "Bạn chưa có dự án";
    query.push({
      project_id: { in: data },
    });
    return await this.queryProject(
      {
        query: query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      true
    );
  };

  // get all projects has been deleted
  static trash = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    let query = [];
    query.push({
      deletedMark: true,
    });
    return await this.queryProject(
      {
        query: query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
      },
      false
    );
  };
  // detail project
  static detail = async (project_id) => {
    const project = await prisma.project.findUnique({
      where: { project_id },
      select: this.select,
    });
    if (!project) throw new NotFoundError("No project found");
    return project;
  };
  // update project
  static update = async ({ id, data }, modifiedBy) => {
    const updateProject = await prisma.project.update({
      where: { project_id: id },
      data: { ...data, modifiedBy },
      select: this.select,
    });
    if (updateProject) {
      return updateProject;
    }
    throw new BadRequestError("Update project failed");
  };

  // delete project
  static delete = async (project_id) => {
    const deleteProject = await prisma.project.update({
      where: { project_id },
      select: this.select,
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
    if (deleteProject) {
      return true;
    }
    await this.restore(project_id);
    throw new BadRequestError("Xoá dự án không thành công");
  };
  // restore project
  static restore = async (project_id) => {
    const restoreProject = await prisma.project.update({
      where: { project_id },
      select: this.select,
      data: {
        deletedMark: false,
      },
    });
    if (restoreProject) {
      return true;
    }
    await this.delete(project_id);
    throw new BadRequestError("Khôi phục dự án không thành công");
  };
  // upload file to cloud and store it in db

  static uploadFile = async (project_id, filename) => {
    const existingProject = await prisma.project.findUnique({
      where: { project_id },
    });
    if (!existingProject) throw new BadRequestError("Dự án không tồn tại");
    try {
      const uploadFile = await prisma.project.update({
        where: { project_id },
        data: {
          document: [...existingProject.document, filename],
        },
      });
      if (uploadFile) return true;
      return false;
    } catch (e) {
      throw new BadRequestError(`Đã sảy ra lỗi: ${e.message}`);
    }
  };
  static async update({ project_id, data, modifiedBy }) {
    if (data.document) {
      try {
        return await prisma.project.update({
          where: { project_id },
          data: { ...data, modifiedBy },
        });
      } catch (error) {
        console.error("Failed to update project:", error);
        throw new BadRequestError(
          "Cập nhật không thành công, vui lòng thử lại."
        );
      }
    }
    return await prisma.project.update({
      where: { project_id },
      data: { ...data, modifiedBy },
      select: this.select,
    });
  }
  static queryProject = async (
    { query, items_per_page, page, search, nextPage, previousPage },
    isNotTrash = true,
    anotherSelected
  ) => {
    const searchKeyword = search || "";
    let itemsPerPage = 10;
    let whereClause = {
      OR: [
        {
          name: {
            contains: searchKeyword,
          },
        },
        {
          projectCode: {
            contains: searchKeyword,
          },
        },
      ],
    };
    if (query && query.length > 0) {
      whereClause.AND = query;
    }
    const total = await prisma.project.count({
      where: whereClause,
    });
    if (items_per_page !== "ALL") {
      itemsPerPage = Number(items_per_page) || 10;
    } else {
      itemsPerPage = total;
    }
    const currentPage = Number(page) || 1;
    const skip = currentPage > 1 ? (currentPage - 1) * itemsPerPage : 0;
    const projects = await prisma.project.findMany({
      take: itemsPerPage,
      skip,
      select: anotherSelected || this.select,
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });
    if (isNotTrash) {
      const projectPromise = projects.map(async (project, index) => {
        const result = await getTotalTaskWithStatusFromProjectAndTotalStaff(
          project.project_id
        );
        const projectManagerInformation = await getUser(
          project.project_manager_id
        );
        project.project_manager = projectManagerInformation;
        project.total_staff = result.total_staff;
        project.total_task = {
          total_task_is_done: result.total_task_is_done,
          total_task_is_not_done: result.total_task_is_not_done,
        };
      });
      await Promise.all(projectPromise);
    }
    const lastPage = Math.ceil(total / itemsPerPage);
    const nextPageNumber = currentPage + 1 > lastPage ? null : currentPage + 1;
    const previousPageNumber = currentPage - 1 < 1 ? null : currentPage - 1;
    return {
      data: projects,
      total,
      nextPage: nextPageNumber,
      previousPage: previousPageNumber,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = ProjectService;
