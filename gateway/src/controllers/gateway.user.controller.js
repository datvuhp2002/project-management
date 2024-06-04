// "use strict";
// const gateWayRequestUserServices = require("../services/gateway.user.services");
// const { OK, CREATED, SuccessResponse } = require("../core/success.response");
// class gatewayRequestUserServicesController {
//   findByEmail = async (req, res, next) => {
//     new SuccessResponse({
//       message: "vui lòng kiểm tra email của bạn",
//       data: await gateWayRequestUserServices.findByEmail(req.body),
//     }).send(res);
//   };
//   create = async (req, res, next) => {
//     new SuccessResponse({ 
//       message: "Tạo nhân viên mới thành công", 
//       data: await gateWayRequestUserServices.create(req.body, req.headers.user),
//     }).send(res);
//   };
//   forgetPassword = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Vui lòng kiểm tra email của bạn",
//       data: await gateWayRequestUserServices.forgetPassword({ email: req.body.email }),
//     }).send(res);
//   };
//   changePassword = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Thay đổi mật khẩu thành công",
//       data: await gateWayRequestUserServices.changePassword(req.body),
//     }).send(res);
//   };
//   findByEmail = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Tìm email thành công",
//       data: await gateWayRequestUserServices.findByEmail(req.params.email),
//     }).send(res);
//   };
//   getAllStaffByUserProperty = async (req, res, next) => {
//     console.log(req.body);
//     new CREATED({
//       message: "Lấy tất cả nhân viên trong phòng ban thành công",
//       data: await gateWayRequestUserServices.getAllStaffByUserProperty(req.query, req.body),
//     }).send(res);
//   };
//   getAll = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Lấy ra danh sách người dùng thành công",
//       data: await gateWayRequestUserServices.getAll(req.query),
//     }).send(res);
//   };
//   getListOfStaffDoesNotHaveDepartment = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Lấy ra danh nhân viên chưa có phòng ban thành công",
//       data: await gateWayRequestUserServices.getListOfStaffDoesNotHaveDepartment(req.query),
//     }).send(res);
//   };
//   getAllStaffInDepartment = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Lấy ra danh sách người dùng thành công",
//       data: await gateWayRequestUserServices.getAllStaffInDepartment(req.query, req.body),
//     }).send(res);
//   };
//   getAllStaffInDepartmentForAdmin = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Lấy ra danh sách người dùng thành công",
//       data: await gateWayRequestUserServices.getAllStaffInDepartmentForAdmin(
//         req.query,
//         req.params.id
//       ),
//     }).send(res);
//   };
//   trash = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Lấy ra danh sách người dùng bị xoá thành công",
//       data: await gateWayRequestUserServices.trash(req.query),
//     }).send(res);
//   };
//   detail = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Thông tin người dùng",
//       data: await gateWayRequestUserServices.detail(req.headers.user),
//     }).send(res);
//   };
//   information = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Thông tin người dùng",
//       data: await gateWayRequestUserServices.detail(req.params.id),
//     }).send(res);
//   };
//   update = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Cập nhật nhân viên thành công",
//       data: await gateWayRequestUserServices.update({ id: req.headers.user, data: req.body }),
//     }).send(res);
//   };
//   updateStaff = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Cập nhật nhân viên thành công",
//       data: await gateWayRequestUserServices.update({
//         id: req.params.id,
//         data: req.body,
//       }),
//     }).send(res);
//   };
//   delete = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Xoá thành công nhân viên",
//       data: await gateWayRequestUserServices.delete(req.params.id),
//     }).send(res);
//   };
//   restore = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Khôi phục thành công nhân viên",
//       data: await gateWayRequestUserServices.restore(req.params.id),
//     }).send(res);
//   };
//   addUserIntoDepartment = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Thêm thành công nhân viên vào phòng ban",
//       data: await gateWayRequestUserServices.addUserIntoDepartment(req.body, req.params.id),
//     }).send(res);
//   };
//   removeStaffFromDepartment = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Xoá thành công nhân viên ra khỏi phòng ban",
//       data: await gateWayRequestUserServices.removeStaffFromDepartment(
//         req.body,
//         req.params.id
//       ),
//     }).send(res);
//   };
//   uploadAvatar = async (req, res, next) => {
//     const { file } = req;
//     if (!file) {
//       throw new BadRequestError("File is missing");
//     }
//     new SuccessResponse({
//       message: "Cập nhật avatar thành công",
//       data: await gateWayRequestUserServices.uploadAvatar(file, req.headers.user),
//     }).send(res);
//   };
//   uploadImageFromUrl = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Tải avatar thành công",
//       data: await uploadImageFromUrl(req.body, req.headers.user),
//     }).send(res);
//   };
//   uploadFileAvatarFromLocal = async (req, res, next) => {
//     const { file } = req;
//     if (!file) {
//       throw new BadRequestError("File is missing");
//     }
//     new SuccessResponse({
//       message: "Tải ảnh đại diện lên thành công",
//       data: getInfoData({
//         fields: ["path", "filename"],
//         object: file,
//       }),
//     }).send(res);
//   };
//   getAvatar = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Lấy ảnh đại diện về thành công",
//       data: await gateWayRequestUserServices.getAvatar(req.body.avatar),
//     }).send(res);
//   };
//   deleteAvatarInCloud = async (req, res, next) => {
//     new SuccessResponse({
//       message: "Xóa ảnh đại diện thành công",
//       data: await gateWayRequestUserServices.deleteAvatarInCloud(
//         req.body.avatar,
//         req.headers.user
//       ),
//     }).send(res);
//   };
// }
// module.exports = new gatewayRequestUserServicesController();
