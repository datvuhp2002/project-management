"use strict";
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configs/cloudinary.config");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  allowedFormat: ["jpg", "png", "jpeg"],
  params: {
    folder: (req, file) => `avatar/${req.headers.user}`,
    format: async (req, file) => {
      return "jpg";
    },
    public_id: (req, file) => file.originalname,
  },
});
const uploadAvatar = multer({
  storage: storage,
});

module.exports = { uploadAvatar };
