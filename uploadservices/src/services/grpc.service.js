"use strict";
const uploadServices = require("./upload.services");
const grpc = require("@grpc/grpc-js");

async function getAvatar(call, callback) {
  const { avatar } = call.request;
  try {
    const avatarResponse = await uploadServices.getAvatar({ avatar });
    if (avatarResponse) {
      callback(null, { avatar: avatarResponse });
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Avatar not found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: "Internal server error",
    });
  }
}

module.exports = { getAvatar };
