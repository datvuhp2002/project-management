"use strict";
const prisma = require("../prisma");
const crypto = require("crypto");
const generatorTokenRandom = () => {
  // Generate 3 random bytes
  const randomBytes = crypto.randomBytes(3);
  // Convert the bytes to an integer
  const otp = randomBytes.readUIntBE(0, 3) % 1000000;
  // Convert the integer to a string and pad it with leading zeros if necessary
  return otp.toString().padStart(6, "0");
};
const newOtp = async ({ email }) => {
  // check otp exist
  const isOtpExist = await prisma.otp.findUnique({ where: { email } });
  if (isOtpExist) {
    await prisma.otp.delete({ where: { email } });
  }
  const token = generatorTokenRandom();
  const expireAt = new Date();
  expireAt.setMinutes(expireAt.getMinutes() + 5);
  const newOTP = await prisma.otp.create({
    data: {
      token: token.toString(),
      email,
      expireAt,
    },
  });
  return newOTP.token;
};
module.exports = {
  newOtp,
};
