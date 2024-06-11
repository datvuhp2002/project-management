const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log("Data from server:", responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway";
  res.send(responseData);
};
const userServicesRoutes = {
  "/admin/get-all": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
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
  "/find-by-email": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/findByEmail`,
    authRequired: false,
    permissions: null,
  },
  "/get-all-staff-in-department": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffInDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/get-all-staff-by-user-property": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffByUserProperty`,
    authRequired: true,
    permissions: null,
  },
  "/admin/get-all-staff-in-department": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/getAllStaffInDepartment`,
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
  "/information": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/information`,
    authRequired: true,
    permissions: null,
  },
  "/admin/restore": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
  },
  "/add-user-into-department": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/addUserIntoDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/get-a-list-of-staff-do-not-have-departments": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getListOfStaffDoNotHaveDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/get-all-staff-in-project": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffInProject`,
    authRequired: true,
    permissions: null,
  },
  "/remove-staff-from-department": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/removeStaffFromDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
  "/upload-avatar-from-local": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/uploadAvatarFromLocal`,
    authRequired: true,
    permissions: null,
  },
  "/get-avatar": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAvatar`,
    authRequired: true,
    permissions: null,
  },
  "/delete-avatar-in-cloud": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/deleteAvatarInCloud`,
    authRequired: true,
    permissions: null,
  },
};
module.exports = userServicesRoutes;
