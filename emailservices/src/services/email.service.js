"use strict";
const prisma = require("../prisma/index.js");
const { newOtp } = require("./otp.service.js");
const { getTemplate } = require("./template.service.js");
const transport = require("../dbs/init.nodemailer.js");
const { BadRequestError, NotFoundError } = require("../core/error.response.js");
const { replacePlaceholder } = require("../utils/index.js");

const sendEmailLinkVerify = async ({
  html,
  toEmail,
  subject = "Xác nhận email đăng ký",
  text = "xác nhận..",
}) => {
  try {
    const mailOptions = {
      from: '"Lachongtech" <thuctaplachong@gmail.com>',
      to: toEmail,
      subject,
      text,
      html,
    };
    const info = await transport.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err; // Re-throw the error after logging it
  }
};

const sendEmailToken = async (email) => {
  if (!email) {
    throw new BadRequestError("Email is required");
  }
  // 1. Create new token or OTP
  const token = await newOtp(email);
  // 2. Get email template
  const template = await getTemplate({ name: "HTML_MAIL_TOKEN" });
  if (!template) {
    throw new NotFoundError("Template is not found");
  }
  // 3. Replace placeholder with params
  const content = replacePlaceholder(template.html, {
    link_verify: token,
    email: `${email}`,
  });
  // 4. Send email
  return await sendEmailLinkVerify({
    html: content,
    toEmail: email,
    subject: "Vui lòng xác nhận địa chỉ email đăng ký",
  });
};

const verifyToken = async ({ token, email }) => {
  const getToken = await prisma.otp.findFirst({
    where: {
      token,
      email,
      expireAt: {
        gt: new Date(),
      },
    },
  });
  if (!getToken) {
    throw new NotFoundError("Mã không đúng hoặc đã hết hạn, vui lòng thử lại");
  }
  const deleteToken = await prisma.otp.delete({
    where: { token_id: getToken.token_id, email },
  });
  if (deleteToken) return { email: getToken.email };
  throw new BadRequestError("Hệ thống gặp trục trặc, vui lòng thử lại");
};

module.exports = { sendEmailToken, verifyToken };
