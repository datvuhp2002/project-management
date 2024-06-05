const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log('Data from server:', responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway"
  res.send(responseData);
};
const userServicesRoutes = {
  "/forget-password": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/forget-password`,
    authRequired: false,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/change-password": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/change-password`,
    authRequired: false,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/find-by-email": { 
    target:`${process.env.USER_SERVICES_REQUEST_URL}/findByEmail`,
    authRequired: false,
    permissions: null,
    customHandler: customConsoleHandler  
  },
  "/get-all-staff-in-department": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffInDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
    customHandler: customConsoleHandler
  },
  "/get-all-staff-by-user-property": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAllStaffByUserProperty`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/admin/get-all-staff-in-department": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/getAllStaffInDepartment`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/admin/get-all": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/admin/trash": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/trash`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/create": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/create`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
    customHandler: customConsoleHandler
  },
  "/admin/delete": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/delete`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/update": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/update`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/admin/update": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/update`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/detail": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/information": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/information`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/admin/restore": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/admin/restore`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
  },
  "/add-user-into-department": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/addUserIntoDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
    customHandler: customConsoleHandler
  },
  "/get-a-list-of-all-managers-who-do-not-manage-departments": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getListOfStaffDoesNotHaveDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
    customHandler: customConsoleHandler
  },
  "/remove-staff-from-department": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/removeStaffFromDepartment`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
    customHandler: customConsoleHandler
  },
  "/upload-avatar-from-local": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/uploadAvatarFromLocal`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/get-avatar": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/getAvatar`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/delete-avatar-in-cloud": {
    target: `${process.env.USER_SERVICES_REQUEST_URL}/deleteAvatarInCloud`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
};
module.exports = userServicesRoutes;
