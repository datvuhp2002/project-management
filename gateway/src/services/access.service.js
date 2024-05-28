"use strict";

const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const { generateAccessToken, createTokenPair } = require("../auth/authUtils");
const {
  getUserByEmail,
  getAllProjectInDepartment,
  addTasksToProjects,
  addTasksAndActivitiesToProjects,
} = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
// service

class AccessService {
  /*
    1 - check email in db
    2 - match Password
    3 - create AT and RT and save
    4 - generate Token
    5 - get data return login
  */
  static reportForDepartment = async (department_id) => {
    const listProject = await getAllProjectInDepartment(department_id);
    const listProjectWithTask = await addTasksToProjects(listProject);
    return listProjectWithTask;
  };

  static login = async ({ email, password }) => {
    // await sendMessage("find-by-email", { email, password });
    const userData = await getUserByEmail(email);
    const match = await bcrypt.compare(password, userData.user.password);
    if (!match) {
      throw new AuthFailureError("Error: Mật khẩu không đúng, hãy thử lại");
    } else {
      const { user_id: userId } = userData.user;
      const { user_property_id: userProperty } = userData.user.UserProperty;
      const tokens = await createTokenPair(
        { userId, email, userProperty, role: userData.role.name },
        process.env.PUBLIC_KEY,
        process.env.PRIVATE_KEY
      );
      return {
        tokens,
        role: userData.role.name,
      };
    }
  };

  static handleRefreshToken = async ({ user, refreshToken }) => {
    if (!refreshToken) {
      throw new AuthFailureError("Không có mã được gửi lên");
    }
    console.log("USER:::", user);
    const { userId, email } = user;
    const userData = await getUserByEmail(email);
    if (!userData) throw new AuthFailureError("User is not registered");
    // create new token
    const token = await generateAccessToken(
      { userId, email, role: user.role, userProperty: user.userProperty },
      process.env.PUBLIC_KEY
    );
    return {
      accessToken: token.accessToken,
    };
  };
}

module.exports = AccessService;
