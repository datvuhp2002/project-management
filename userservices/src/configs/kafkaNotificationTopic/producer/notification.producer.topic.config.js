"use strict";
const notificationProducerTopic = {
  notiForCreateUser: "noti-for-create-user",
  notiForUpdateUser: "noti-for-update-user",
  deleteUser: "delete-user",
  restoreUser: "restore-user",
  notiForRemoveManager: "noti-for-remove-manager",
  notiForAddManager: "noti-for-add-manager",
  notiForAddStaffIntoDepartment: "noti-for-add-staff-into-department",
  notiForRemoveStaffFromDepartment: "noti-for-remove-staff-from-department",
};

module.exports = { notificationProducerTopic };
