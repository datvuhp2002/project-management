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
const { userProducerTopic } = require("../configs/kafkaUserTopic");
const {
  notificationProducerTopic,
} = require("../configs/kafkaNotificationTopic");
const { runProducer } = require("../message_queue/producer");
const {
  getTotalTaskWithStatusFromProjectAndTotalStaff,
  getUser,
  getAllUserProject,
  GetDepartment,
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
    department_ids: true,
  };
  // create a new project
  static create = async (data, createdBy) => {
    data.createdBy = createdBy;
    data.department_ids = data.department_ids || [];
    data.project_manager_id = data.project_manager_id || null;
    const currentDate = new Date();
    const startDate = new Date(data.startAt) || currentDate;
    const endDate = new Date(data.endAt);
    // Validate the datesget
    if (isNaN(startDate) || isNaN(endDate)) {
      throw new BadRequestError("Invalid start or end date provided.");
    }
    if (startDate < currentDate) {
      throw new BadRequestError(
        "Start date cannot be earlier than the current date."
      );
    }
    if (endDate <= startDate) {
      throw new BadRequestError("End date must be later than the start date.");
    }
    // Create the project
    try {
      const newProject = await prisma.project.create({ data });
      if (newProject) {
        if (newProject.department_ids.length > 0) {
          const departmentPromises = newProject.department_ids.map((id) =>
            GetDepartment(id)
          );
          const departments = await Promise.all(departmentPromises);
          const departmentNames = departments.map((dept) => dept.name);
          const message =
            departmentNames.length === 1
              ? `Project ${newProject.name} has been created in the ${departmentNames[0]} department`
              : `Project ${
                  newProject.name
                } has been created in the ${departmentNames
                  .slice(0, -1)
                  .join(", ")} and ${
                  departmentNames[departmentNames.length - 1]
                } departments`;
          runProducer(notificationProducerTopic.notiForCreateProject, {
            department_ids: newProject.department_ids,
            message,
            createdBy,
            target_id: newProject.project_id,
            target_name: newProject.name,
            targetFor: "PROJECT",
          });
        } else {
          const message = `Project ${newProject.name} has been created`;
          runProducer(notificationProducerTopic.notiForCreateProject, {
            department_ids: [],
            message,
            createdBy,
            target_id: newProject.project_id,
            target_name: newProject.name,
            targetFor: "PROJECT",
          });
        }
      }

      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw new BadRequestError(
        "Failed to create the project, please try again."
      );
    }
  };
  // get all projects
  static getAll = async ({
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
    department_id,
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
        department_id,
      },
      true
    );
  };
  static getAllInfoProjectInDepartment = async (
    { items_per_page, page, search, nextPage, previousPage, department_id },
    { id }
  ) => {
    let query = [];
    query.push({
      department_ids: { has: id },
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
        department_id,
      },
      false,
      select
    );
  };
  // get all projects in department
  static getAllProjectInDepartment = async (
    { items_per_page, page, search, nextPage, previousPage, department_id },
    { id }
  ) => {
    let query = [];
    query.push({
      department_ids: { has: id },
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
        department_id,
      },
      true
    );
  };
  // get all projects ids in department
  static getAllProjectIdsInDepartment = async (department_id) => {
    const projects = await prisma.project.findMany({
      where: { department_ids: { has: department_id } },
      select: { project_id: true },
    });
    const ids = projects.map((project) => project.project_id);
    return ids;
  };
  static getAllUserProjectInDepartment = async (
    { items_per_page, page, search, nextPage, previousPage },
    department_id,
    user_id
  ) => {
    let query = [];
    query.push({
      department_ids: { has: department_id },
      deletedMark: false,
    });
    try {
      const data = await getAllUserProject(user_id);
      if (data.length === 0) return "Bạn chưa có dự án";
      query.push({
        project_id: { in: data },
      });
    } catch (e) {
      console.log("Assignment service maybe close:::", e);
    }
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
  static getUserProject = async (
    { items_per_page, page, search, nextPage, previousPage, department_id },
    user_id
  ) => {
    let query = [];
    query.push({
      deletedMark: false,
    });
    try {
      const data = await getAllUserProject(user_id);
      console.log(data);
      if (data.length === 0) return "Bạn chưa có dự án";
      query.push({
        project_id: { in: data },
      });
    } catch (e) {
      console.log("Assignment service maybe close:::", e);
    }
    return await this.queryProject(
      {
        query: query,
        items_per_page,
        page,
        search,
        nextPage,
        previousPage,
        department_id,
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
    department_id,
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
        department_id,
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
    try {
      const projectManagerInformation = await getUser(
        project.project_manager_id
      );
      project.project_manager = projectManagerInformation;
      // Fetch department details for each department ID in the project
      // Fetch department details for all department IDs in the project
      const departmentPromises = project.department_ids.map((id) =>
        GetDepartment(id)
      );
      const departments = await Promise.all(departmentPromises);
      // Attach department info directly to the project
      project.department_info = departments;
    } catch (e) {
      console.error(e);
    }
    return project;
  };
  static removeProjectsFromDepartment = async ({
    department_id,
    department_name,
  }) => {
    if (!department_id) {
      throw new BadRequestError("department_id is required");
    }
    // Lấy danh sách tất cả các dự án có department_ids chứa department_id này
    const projects = await prisma.project.findMany({
      where: {
        department_ids: {
          has: department_id,
        },
      },
      select: {
        project_id: true,
        name: true,
        department_ids: true,
      },
    });
    // Cập nhật các dự án với danh sách department_ids mới
    const updatePromises = projects.map((project) => {
      const filteredDepartmentIds = project.department_ids.filter(
        (id) => id !== department_id
      );
      return prisma.project.update({
        where: { project_id: project.project_id },
        data: { department_ids: { set: filteredDepartmentIds } },
      });
    });
    // Thực hiện tất cả các cập nhật
    await Promise.all(updatePromises);
    await runProducer(
      notificationProducerTopic.notiForRemoveProjectsFromDepartment,
      {
        project_ids: projects.map((project) => ({
          project_id: project.project_id,
          name: project.name,
        })),
        department_name,
      }
    );
    return { message: "Projects updated successfully" };
  };
  // update project
  static update = async ({ id, data }, modifiedBy) => {
    try {
      // Lấy thông tin của dự án trước khi cập nhật
      const findProjects = await prisma.project.findUnique({
        where: { project_id: id },
        select: { department_ids: true, project_manager_id: true },
      });

      // Lấy thông tin người dùng
      const userInfo = await getUser(modifiedBy);

      // Kiểm tra quyền hạn của người dùng
      if (
        userInfo.role_name === "STAFF" &&
        modifiedBy !== findProjects.project_manager_id
      ) {
        throw new BadRequestError(
          "You do not have permission to update this project"
        );
      }

      // Cập nhật department_ids nếu có
      data.department_ids = data.department_ids || findProjects.department_ids;

      // Cập nhật dự án
      const updateProject = await prisma.project.update({
        where: { project_id: id },
        data: { ...data, modifiedBy },
        select: this.select,
      });

      if (updateProject) {
        // So sánh department_ids
        const oldDepartmentIds = new Set(findProjects.department_ids || []);
        const newDepartmentIds = new Set(updateProject.department_ids || []);

        // Tìm các phòng ban mới được thêm vào và các phòng ban đã bị xóa
        const addedDepartments = [...newDepartmentIds].filter(
          (id) => !oldDepartmentIds.has(id)
        );
        const removedDepartments = [...oldDepartmentIds].filter(
          (id) => !newDepartmentIds.has(id)
        );

        if (addedDepartments.length > 0 || removedDepartments.length > 0) {
          if (addedDepartments.length > 0) {
            // Gửi thông báo cho các phòng ban mà dự án được thêm vào
            await Promise.all(
              addedDepartments.map(async (id) => {
                const department = await GetDepartment(id);
                const message = `project has been added to department ${department.name}`;
                await runProducer(
                  notificationProducerTopic.notiForUpdateProject,
                  {
                    message,
                    modifiedBy,
                    project_id: updateProject.project_id,
                    target_name: updateProject.name,
                    targetFor: "PROJECT",
                  }
                );
              })
            );
          }
          if (removedDepartments.length > 0) {
            // Gửi thông báo cho các phòng ban mà dự án đã bị xóa
            await Promise.all(
              removedDepartments.map(async (id) => {
                const department = await GetDepartment(id);
                const message = `project has been removed from department ${department.name}`;
                await runProducer(
                  notificationProducerTopic.notiForUpdateProject,
                  {
                    project_id: updateProject.project_id,
                    message,
                    modifiedBy,
                    target_name: updateProject.name,
                    targetFor: "PROJECT",
                  }
                );
              })
            );
          }
        } else {
          // Nếu không có thay đổi về department_ids, gửi thông báo cập nhật chung
          await runProducer(notificationProducerTopic.notiForUpdateProject, {
            project_id: updateProject.project_id,
            message: `Project ${updateProject.name} has been updated`,
            modifiedBy,
          });
        }

        return updateProject;
      }

      throw new BadRequestError("Update project failed");
    } catch (error) {
      console.error("Error updating project:", error);
      throw new BadRequestError(
        "Failed to update the project, please try again."
      );
    }
  };
  // delete project
  static delete = async (project_id, modifiedBy = null) => {
    const findProject = await prisma.project.findUnique({
      where: { project_id },
      select: { project_manager_id: true },
    });
    if (modifiedBy) {
      const userInfo = await getUser(modifiedBy);
      if (
        userInfo.role_name === "STAFF" &&
        modifiedBy === findProject.project_manager_id
      ) {
        throw new BadRequestError(
          "You do not have permission to delete this project"
        );
      }
    }
    const deleteProject = await prisma.project.update({
      where: { project_id },
      select: this.select,
      data: {
        deletedMark: true,
        deletedAt: new Date(),
      },
    });
    if (deleteProject) {
      runProducer(notificationProducerTopic.notiForDeleteProject, {
        department_ids: deleteProject.department_ids,
        project_id,
        message: `project has been deleted`,
        createdBy: modifiedBy,
        targetFor: "PROJECT",
        target_name: deleteProject.name,
      });
      return true;
    }
    await this.restore(project_id, modifiedBy);
    throw new BadRequestError("Xoá dự án không thành công");
  };
  static softDeleteMultipleProjects = async (projectIds) => {
    try {
      await Promise.all(
        projectIds.map((project_id) => this.delete(project_id, null))
      );
      return true;
    } catch (e) {
      throw new BadRequestError(e);
    }
  };
  static forceDeleteMultipleProjects = async (projectIds) => {
    try {
      await Promise.all(
        projectIds.map((project_id) => this.forceDelete(project_id, null))
      );
      return true;
    } catch (e) {
      throw new BadRequestError(e);
    }
  };
  static forceDelete = async (project_id, modifiedBy) => {
    const deleteProject = await prisma.project.delete({
      where: { project_id },
    });
    if (!deleteProject) {
      throw new BadRequestError("Xoá dự án không thành công");
    }
    try {
      runProducer(assignmentProducerTopic.forceDeleteProjectAssignment, {
        project_id,
        modifiedBy,
      });
      runProducer(notificationProducerTopic.notiForDeleteProject, {
        department_ids: deleteProject.department_ids,
        project_id,
        message: `project has been deleted`,
        createdBy: modifiedBy,
        targetFor: "PROJECT",
        target_name: deleteProject.name,
      });
    } catch (err) {
      throw new BadRequestError(err);
    }
    return true;
  };
  // restore project
  static restore = async (project_id, modifiedBy) => {
    const restoreProject = await prisma.project.update({
      where: { project_id },
      select: this.select,
      data: {
        deletedMark: false,
      },
    });
    if (restoreProject) {
      await runProducer(notificationProducerTopic.notiForRestoreProject, {
        department_ids: restoreProject.department_ids,
        project_id,
        message: `project ${restoreProject.name} has been restored`,
        createdBy: modifiedBy,
      });
      return true;
    }
    await this.delete(project_id, null);
    throw new BadRequestError("Khôi phục dự án không thành công");
  };
  static multipleRestoreProject = async (projectIds) => {
    try {
      await Promise.all(
        projectIds.map((project_id) => this.restore(project_id, null))
      );
      return true;
    } catch (e) {
      throw new BadRequestError(e);
    }
  };
  // delete file
  static deleteFile = async ({ project_id, filename }) => {
    const project = await prisma.project.findUnique({ where: { project_id } });
    if (!project) throw new BadRequestError("Project not found");
    const updatedDocuments = project.document.filter((doc) => doc !== filename);
    const updateProject = await prisma.project.update({
      where: { project_id },
      data: { document: updatedDocuments },
    });
    if (!updateProject) throw new BadRequestError("Can not delete this file");
    return true;
  };
  // store file in db
  static uploadFile = async (project_id, filename) => {
    const existingProject = await prisma.project.findUnique({
      where: { project_id },
    });
    if (!existingProject) throw new BadRequestError("Project not found");
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
  static queryProject = async (
    {
      query,
      items_per_page,
      page,
      search,
      hasDepartment = "true",
      nextPage,
      previousPage,
      department_id = null,
    },
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

    if (hasDepartment === "false") {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          department_ids: {
            hasSome: [],
          },
        },
      ];
    }
    if (department_id) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          department_ids: {
            has: department_id,
          },
        },
      ];
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
      const projectPromises = projects.map(async (project) => {
        try {
          const result = await getTotalTaskWithStatusFromProjectAndTotalStaff(
            project.project_id
          );
          const projectManagerInformation = await getUser(
            project.project_manager_id
          );
          // Fetch department details for all department IDs in the project
          const departmentPromises = project.department_ids.map((id) =>
            GetDepartment(id)
          );
          const departments = await Promise.all(departmentPromises);

          // Attach department info directly to the project
          project.department_info = departments;
          // another info
          project.project_manager = projectManagerInformation;
          project.total_staff = result.total_staff;
          project.total_task = {
            total_task_is_done: result.total_task_is_done,
            total_task_is_not_done: result.total_task_is_not_done,
          };
        } catch (error) {
          console.error(
            `Error fetching details for project ${project.project_id}:`,
            error
          );
          project.total_staff = "N/A";
          project.total_task = {
            total_task_is_done: "N/A",
            total_task_is_not_done: "N/A",
          };
        }
      });

      await Promise.all(projectPromises);
    }

    const lastPage = Math.ceil(total / itemsPerPage);
    const nextPageNumber = currentPage + 1 > lastPage ? null : currentPage + 1;
    const previousPageNumber = currentPage - 1 < 1 ? null : currentPage - 1;

    return {
      data: projects,
      total,
      nextPage: nextPageNumber,
      previousPage: previousPageNumber,
      lastPage,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = ProjectService;
