"use strict";
const permissionsAuthentication = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return res.status(403).json({
        message: "Permissions denied",
      });
    }
    const userRole = req.role;
    const hasRequiredPermission = requiredPermissions.some((permission) => {
      return (
        userRole === permission ||
        userRole === "ADMIN" ||
        userRole === "SUPER_ADMIN"
      );
    });
    if (
      hasRequiredPermission ||
      userRole === "ADMIN" ||
      userRole === "SUPER_ADMIN"
    ) {
      return next();
    } else {
      return res.status(403).json({
        message: `Chỉ có ${requiredPermissions.join(
          ", "
        )} mới được xem thông tin này`,
      });
    }
  };
};
module.exports = { permissionsAuthentication };
