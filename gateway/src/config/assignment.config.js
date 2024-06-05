"use strict";
const customConsoleHandler = (req, res) => {
  const responseData = req.processedData;
  console.log('Data from server:', responseData);
  responseData.gateway_message = "Đây là dữ liệu từ gateway"
  res.send(responseData);
};

const assignmentServicesRoutes = {
  "/admin/get-all": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/admin/getAll`,
    authRequired: true,
    permissions: ["ADMIN"],
    customHandler: customConsoleHandler
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
    customHandler: customConsoleHandler
  },
  "/get-all-user-property-from-project": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllUserPropertyFromProject`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
    customHandler: customConsoleHandler 
    
  },
  "/get-all-assignment-for-user": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllAssignmentForUser`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/get-all-assignment-for-project": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllAssignmentForProject`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/get-all-assignment-for-task": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllAssignmentForTask`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/get-all-task-property-from-project": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/getAllTaskPropertyFromProject`,
    authRequired: true,
    permissions: null,
    customHandler: customConsoleHandler
  },
  "/remove-staff-from-project": {
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
    permissions: ["ADMIN", "MANAGER"],
  },
  "/detail": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/detail`,
    authRequired: true,
    permissions: null,
  },
  "/delete": {
    target: `${process.env.ASSIGNMENT_SERVICES_REQUEST_URL}/delete`,
    authRequired: true,
    permissions: ["ADMIN", "MANAGER"],
  },
};
module.exports = assignmentServicesRoutes;
