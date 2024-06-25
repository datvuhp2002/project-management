"use strict";
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configs/cloudinary.config");
const storageClient = new CloudinaryStorage({
  cloudinary: cloudinary,
  allowedFormat: ["jpg", "png", "jpeg"],
  params: {
    folder: (req, file) => `avatar/client/${req.params.id}`,
    format: async (req, file) => {
      return "jpg";
    },
  },
});
const storageProjectFile = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: `project/${req.params.id}`,
      resource_type: "raw",
      raw_convert: "aspose",
      public_id: file.originalname,
    };
  },
});
const uploadClient = multer({
  storage: storageClient,
});
const uploadProject = multer({
  storage: storageProjectFile,
});
module.exports = { uploadClient, uploadProject };
