"use strict";
const express = require("express");
const gatewayUserController = require("../../controllers/gateway.user.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { permissionsAuthentication } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();
// router.use(authentication);
router.get(
  "/findByEmail/:email",
  asyncHandler(gatewayUserController.findByEmail)
);
router.post(
  "/create",
  asyncHandler(gatewayUserController.create)
)
router.post("/forget-password", asyncHandler(gatewayUserController.forgetPassword));
router.put("/change-password", asyncHandler(gatewayUserController.changePassword));
router.get("/admin/getAll", asyncHandler(gatewayUserController.getAll));
router.get(
  "/getListOfStaffDoesNotHaveDepartment",
  asyncHandler(gatewayUserController.getListOfStaffDoesNotHaveDepartment)
);
router.post(
  "/getAllStaffInDepartment",
  asyncHandler(gatewayUserController.getAllStaffInDepartment)
);
router.get(
  "/admin/getAllStaffInDepartment/:id",
  asyncHandler(gatewayUserController.getAllStaffInDepartmentForAdmin)
);
router.get("/admin/trash", asyncHandler(gatewayUserController.trash));
router.post("/create", asyncHandler(gatewayUserController.create));
router.post(
  "/getAllStaffByUserProperty",
  asyncHandler(gatewayUserController.getAllStaffByUserProperty)
);
router.post(
  "/uploadAvatarFromUrl",
  asyncHandler(gatewayUserController.uploadImageFromUrl)
);
router.post(
  "/uploadAvatarFromLocal",
  upload.single("file"),
  asyncHandler(gatewayUserController.uploadFileAvatarFromLocal)
);
router.post("/getAvatar", asyncHandler(gatewayUserController.getAvatar));
router.post(
  "/deleteAvatarInCloud",
  asyncHandler(gatewayUserController.deleteAvatarInCloud)
);
router.put("/update", asyncHandler(gatewayUserController.update));
router.put("/admin/update/:id", asyncHandler(gatewayUserController.updateStaff));
router.get("/detail", asyncHandler(gatewayUserController.detail));
router.get("/information/:id", asyncHandler(gatewayUserController.information));
router.delete("/admin/delete/:id", asyncHandler(gatewayUserController.delete));
router.put("/admin/restore/:id", asyncHandler(gatewayUserController.restore));
router.post(
  "/addUserIntoDepartment/:id",
  asyncHandler(gatewayUserController.addUserIntoDepartment)
);
router.post(
  "/removeStaffFromDepartment/:id",
  asyncHandler(gatewayUserController.removeStaffFromDepartment)
);
module.exports = router;
