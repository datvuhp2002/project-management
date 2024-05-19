"use strict";
const prisma = require("../prisma");
const cloudinary = require("../configs/cloudinary.config");
class ClientService {
  static select = {
    client_id: true,
    fullname: true,
    email: true,
    avatar: true,
    address: true,
    phone: true,
    createdBy: true,
    modifiedBy: true,
    ProjectProperty: true,
  };
  static create = async (data, createdBy) => {
    return await prisma.client.create({
      data: { ...data, createdBy },
      select: this.select,
    });
  };
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
    return await this.queryClient({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  static getAllClientFromProject = async (
    { items_per_page, page, search, nextPage, previousPage },
    project_id
  ) => {
    let query = [];
    query.push({
      deletedMark: false,
    });
    query.push({
      ProjectProperty: {
        some: {
          project_id,
        },
      },
    });
    return await this.queryClient({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
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
    return await this.queryClient({
      query: query,
      items_per_page,
      page,
      search,
      nextPage,
      previousPage,
    });
  };
  static findByName = async (name) => {
    return await prisma.client.findFirst({ where: { name } });
  };
  static findById = async ({ id }) => {
    return await prisma.client.findFirst({ where: { role_id: id } });
  };
  static update = async (client_id, data, modifiedBy) => {
    if (data.avatar) {
      try {
        return await prisma.client.update({
          where: { client_id },
          data: { ...data, modifiedBy },
          select: this.select,
        });
      } catch (errr) {
        cloudinary.uploader.destroy(data.avatar);
        throw new BadRequestError(
          "Cập nhật không thành công, vui lòng thử lại."
        );
      }
    }
    return await prisma.client.update({
      where: { client_id },
      data: { ...data, modifiedBy },
      select: this.select,
    });
  };
  static delete = async (client_id) => {
    const deleteClient = await prisma.client.update({
      where: { client_id },
      data: { deletedMark: true, deletedAt: new Date() },
      select: this.select,
    });
    if (deleteClient) return true;
    return null;
  };
  static restore = async (client_id) => {
    const restoreClient = await prisma.client.update({
      where: { client_id },
      data: { deletedMark: false, deletedAt: null },
      select: this.select,
    });
    if (restoreClient) return true;
    return null;
  };
  static getAvatar = async (avatar) => {
    // Return colors in the response
    const options = {
      height: 100,
      width: 100,
      format: "jpg",
    };
    try {
      const result = await cloudinary.url(avatar, options);
      console.log(result);
      return result;
    } catch (error) {
      console.error(error);
    }
  };
  static queryClient = async ({
    query,
    items_per_page,
    page,
    search,
    nextPage,
    previousPage,
  }) => {
    const itemsPerPage = Number(items_per_page) || 10;
    const currentPage = Number(page) || 1;
    const searchKeyword = search || "";
    const skip = currentPage > 1 ? (currentPage - 1) * itemsPerPage : 0;
    let whereClause = {
      OR: [
        {
          fullname: {
            contains: searchKeyword,
          },
        },
        {
          email: {
            contains: searchKeyword,
          },
        },
        {
          address: {
            contains: searchKeyword,
          },
        },
        {
          phone: {
            contains: searchKeyword,
          },
        },
      ],
    };
    if (searchKeyword !== "") {
      whereClause.OR.push({
        client_id: searchKeyword,
      });
    }
    if (query && query.length > 0) {
      whereClause.AND = query;
    }
    const clients = await prisma.client.findMany({
      take: itemsPerPage,
      skip,
      select: this.select,
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });
    const total = await prisma.client.count({
      where: whereClause,
    });
    const lastPage = Math.ceil(total / itemsPerPage);
    const nextPageNumber = currentPage + 1 > lastPage ? null : currentPage + 1;
    const previousPageNumber = currentPage - 1 < 1 ? null : currentPage - 1;
    return {
      clients: clients,
      total,
      nextPage: nextPageNumber,
      previousPage: previousPageNumber,
      currentPage,
      itemsPerPage,
    };
  };
}
module.exports = ClientService;
