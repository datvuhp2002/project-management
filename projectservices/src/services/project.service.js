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
    project_id: true,
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

  // get all projects in department
  static getAllProjectInDepartment = async (
    { items_per_page, page, search, nextPage, previousPage },
    { id }
  ) => {
    let query = [];
    // Thêm điều kiện phòng ban và trạng thái xoá
    query.push({
      department_id: id,
      deletedMark: false,
    });
    // Gọi phương thức queryProject với các tham số đã truyền vào
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
      const deleteProjectProperty = await ProjectPropertyService.delete(
        project_id
      );
      if (deleteProjectProperty) return true;
      await this.restore(project_id);
      throw new BadRequestError("Xoá dự án không thành công");
    }
    return null;
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
      const restoreProjectProperty = await ProjectPropertyService.restore(
        project_id
      );
      if (restoreProjectProperty) return true;
      await this.delete(project_id);
      throw new BadRequestError("Khôi phục dự án không thành công");
    }
    return null;
  };
  // upload file to cloud and store it in db
  // static uploadFile = async (project_id, { path, filename }) => {
  //   const existingProject = await prisma.project.findUnique({
  //     where: { project_id },
  //   });
  //   if (!existingProject) throw new BadRequestError("Dự án không tồn tại");
  //   try {
  //     const uploadFile = await prisma.project.update({
  //       where: { project_id },
  //       data: {
  //         document: [...existingProject.document, filename],
  //       },
  //     });
  //     if (uploadFile) return true;
  //     cloudinary.uploader.destroy(filename);
  //     return false;
  //   } catch (e) {
  //     throw new BadRequestError(`Đã sảy ra lỗi: ${e.message}`);
  //   }
  // };
  static async uploadFile(project_id, fileData) {
    try {
      // Prepare the message payload
      const messagePayload = { project_id, ...fileData };

      // Send the message to the upload topic
      await runProducer(uploadProducerTopic.uploadFile, messagePayload);

      console.log("Upload request sent:", messagePayload);
    } catch (error) {
      console.error("Failed to send upload request:", error);
      throw new Error("Failed to send upload request");
    }
  }

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
  // get Image File from cloudinary
  static getFileImage = async ({ filename }) => {
    const options = {
      height: 500,
      width: 500,
      format: "jpg",
      quality: "auto",
    };
    try {
      const result = await cloudinary.url(filename, options);
      return result;
    } catch (error) {
      console.error(error);
    }
  };
  static getFile = async ({ filename }) => {
    try {
      const result = await cloudinary.url(filename, { resource_type: "raw" });
      return result;
    } catch (error) {
      console.error(error);
    }
  };
  static deleteFile = async (project_id, { filename }) => {
    const existingProject = await prisma.project.findUnique({
      where: { project_id },
    });
    if (!existingProject) throw new BadRequestError("Dự án không tồn tại");
    try {
      const updatedDocument = existingProject.document.filter(
        (file) => file !== filename
      );
      const uploadFile = await prisma.project.update({
        where: { project_id },
        data: {
          document: updatedDocument,
        },
      });
      if (uploadFile) {
        cloudinary.uploader.destroy(filename);
        return true;
      }
      return false;
    } catch (e) {
      throw new BadRequestError(`Đã sảy ra lỗi: ${e.message}`);
    }
  };
  static queryProject = async (
    { query, items_per_page, page, search, nextPage, previousPage },
    isNotTrash = true
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
      select: this.select,
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });
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
