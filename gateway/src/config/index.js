"use strict";

const roleRoutes = {
  "/getAll": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/role/getAll`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
};
const emailRoutes = {
  "/verify-token": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/email/verify-token`,
    authRequired: false,
    permissions: null,
  },
};
const userServicesRoutes = {
  "/forget-password": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/forget-password`,
    authRequired: false,
    permissions: null,
  },
  "/change-password": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/change-password`,
    authRequired: false,
    permissions: null,
  },
  "/findByEmail": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/findByEmail`,
    authRequired: false,
    permissions: null,
  },
  "/getAllStaffInDepartment": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffInDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getAllStaffByUserProperty": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffByUserProperty`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/admin/getAllStaffInDepartment": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/getAllStaffInDepartment`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/getAll": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/create": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/admin/delete": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/update": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: null,
  },
  "/admin/update": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/update`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/detail": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/admin/detail": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/detail`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/delete": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/addUserIntoDepartment": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/addUserIntoDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/removeStaffFromDepartment": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/removeStaffFromDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/uploadAvatarFromLocal": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/uploadAvatarFromLocal`,
    authRequired: true,
    permissions: null,
  },
  "/getAvatar": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAvatar`,
    authRequired: true,
    permissions: null,
  },
  "/deleteAvatarInCloud": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/deleteAvatarInCloud`,
    authRequired: true,
    permissions: null,
  },
};
const departmentServicesRoutes = {
  "/admin/getAll": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/create": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/create`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/delete": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/update": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["MANAGER"],
  },
  "/admin/update": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/update`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/detail": {
    target: `${process.env.DEPARTMENT_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
};
const projectServicesRoutes = {
  "/admin/getAll": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/delete": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/getAllProjectInDepartment": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/getAllProjectInDepartment`,
    authRequired: true,
    permissions: null,
  },
  "/create": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/update": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/detail": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },

  "/uploadFileFromLocal": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/uploadFileFromLocal`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getFileImage": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/getFileImage`,
    authRequired: true,
    permissions: null,
  },
  "/getFile": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/getFile`,
    authRequired: true,
    permissions: null,
  },
  "/deleteFile": {
    target: `${process.env.PROJECT_SERVICES_REQUEST_URL}/deleteFile`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
};
const assignmentServicesRoutes = {
  "/admin/getAll": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/getAllUserPropertyFromProject": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllUserPropertyFromProject`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getAllTaskPropertyFromProject": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllTaskPropertyFromProject`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/removeStaffFromProject": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/removeStaffFromProject`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/create": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/update": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: null,
  },
  "/detail": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/delete": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/delete`,
    authRequired: true,
    permissions: ["ADMIN","MANAGER"],
  },

};
const clientRoutes = {
  "/admin/getAll": {
    target: `${process.env.CLIENT_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.CLIENT_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.CLIENT_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },  
  "/admin/delete": {
    target: `${process.env.CLIENT_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/getAllClientFromProject": {
    target: `${process.env.CLIENT_REQUEST_URL}/getAllClientFromProject`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/create": {
    target: `${process.env.CLIENT_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/update": {
    target: `${process.env.CLIENT_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/detail": {
    target: `${process.env.CLIENT_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },

  "/uploadAvatarFromLocal": {
    target: `${process.env.CLIENT_REQUEST_URL}/uploadAvatarFromLocal`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getAvatar": {
    target: `${process.env.CLIENT_REQUEST_URL}/getAvatar`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
};
const taskServicesRoutes = {
  "/admin/getAll": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/restore": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/create": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/update": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/detail": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/admin/delete": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/uploadFileFromLocal": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/uploadFileFromLocal`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getFileImage": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getFileImage`,
    authRequired: true,
    permissions: null,
  },
  "/getFile": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getFile`,
    authRequired: true,
    permissions: null,
  },
  "/deleteFile": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/deleteFile`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/getAllTaskByTaskProperty": {
    target: `${process.env.TASK_SERVICES_REQUEST_URL}/getAllTaskByTaskProperty`,
    authRequired: true,
    permissions: null,
  },
};
const activityServicesRoutes = {
  "/admin/restore": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/trash": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/getAll": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/admin/getAllActivitiesByUserProperty": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/getAllActivitiesByUserProperty`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/getAllActivitiesByYourProperty": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesByYourProperty`,
    authRequired: true,
    permissions: null,
  },
  "/admin/delete": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/getAllActivitiesFromTask": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/getAllActivitiesFromTask`,
    authRequired: true,
    permissions: null,
  },
  "/create": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: null,
  },
  "/update": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: null,
  },
  "/detail": {
    target: `${process.env.ACTIVITY_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },

};
module.exports = {
  emailRoutes,
  roleRoutes,
  userServicesRoutes,
  projectServicesRoutes,
  departmentServicesRoutes,
  assignmentServicesRoutes,
  clientRoutes,
  taskServicesRoutes,
  activityServicesRoutes,
};
