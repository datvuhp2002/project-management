const userServicesRoutes = {
  "/forget-password": {
    topic: "forget-password",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/forget-password`,
    authRequired: false,
    permissions: null,
  },
  "/change-password": {
    topic: "change-password",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/change-password`,
    authRequired: false,
    permissions: null,
  },
  "/findByEmail": {
    topic: "find-by-email",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/findByEmail`,
    authRequired: false,
    permissions: null,
  },
  "/getAllStaffInDepartment": {
    topic: "get-all-staff-in-department",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffInDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getAllStaffByUserProperty": {
    topic: "get-all-staff-by-user-property",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffByUserProperty`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/admin/getAllStaffInDepartment": {
    topic: "admin-get-all-staff-in-department",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/getAllStaffInDepartment`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/getAll": {
    topic: "admin-get-all",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    topic: "admin-trash",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/create": {
    topic: "create",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/admin/delete": {
    topic: "admin-delete",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/update": {
    topic: "update",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: null,
  },
  "/admin/update": {
    topic: "admin-update",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/update`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/detail": {
    topic: "detail",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/information": {
    topic: "information",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/information`,
    authRequired: true,
    permissions: null,
  },
  "/admin/restore": {
    topic: "admin-restore",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/addUserIntoDepartment": {
    topic: "add-user-into-department",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/addUserIntoDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getListOfStaffDoesNotHaveDepartment": {
    topic: "get-a-list-of-all-managers-who-do-not-manage-departments",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getListOfStaffDoesNotHaveDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/removeStaffFromDepartment": {
    topic: "remove-staff-from-department",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/removeStaffFromDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/uploadAvatarFromLocal": {
    topic: "upload-avatar-from-local",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/uploadAvatarFromLocal`,
    authRequired: true,
    permissions: null,
  },
  "/getAvatar": {
    topic: "get-avatar",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAvatar`,
    authRequired: true,
    permissions: null,
  },
  "/deleteAvatarInCloud": {
    topic: "delete-avatar-in-cloud",
    target: `${process.env.USER_SERVICES_REQUEST_URL}/deleteAvatarInCloud`,
    authRequired: true,
    permissions: null,
  },
};

module.exports = userServicesRoutes;
