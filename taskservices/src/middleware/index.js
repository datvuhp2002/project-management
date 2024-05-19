"use strict";
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configs/cloudinary.config");
const storageFile = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: `task/${req.params.id}`,
      resource_type: "raw",
      raw_convert: "aspose",
      public_id: file.originalname,
    };
  },
});
const uploadFile = multer({
  storage: storageFile,
});
module.exports = { uploadFile };
