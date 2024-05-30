"use strict";

const { getAllStaffByUserProperty } = require("../services/user.service");

const gatewayTopics = {
  forgetPassword: "forget-password",
  changePassword: "change-password",
  findByEmail: "find-by-email",
  getAllStaffInDepartment: "get-all-staff-in-department",
  getAllStaffByUserProperty: "get-all-staff-by-user-property",
  adminGetAllStaffInDepartment: "admin-get-all-staff-in-department",
  adminGetAll: "admin-get-all",
  adminTrash: "admin-trash",
  create: "create",
  adminDelete: "admin-delete",
  update: "update",
  adminUpdate: "admin-update",
  detail: "detail",
  information: "information",
  adminRestore: "admin-restore",
  addUserIntoDepartment: "add-user-into-department",
  removeStaffFromDepartment: "remove-staff-from-department",
  uploadAvatarFromLocal: "upload-avatar-from-local",
  getAvatar: "get-avatar",
  deleteAvatarInCloud: "delete-avatar-in-cloud",
};

module.exports = gatewayTopics;
