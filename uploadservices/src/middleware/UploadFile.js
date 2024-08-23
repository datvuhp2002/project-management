"use strict";
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../configs/cloudinary.config");
const storageClient = new CloudinaryStorage({
  cloudinary: cloudinary,
  // allowedFormat: ["jpg", "png", "jpeg"],
  allowedFormat: "image",
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
      resource_type: "auto",
      raw_convert: "aspose",
      public_id: file.originalname,
    };
  },
});
const storageTaskFile = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: `task/${req.params.id}`,
      // resource_type: "raw",
      resource_type: "auto",
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
const uploadTask = multer({
  storage: storageTaskFile,
});
module.exports = { uploadClient, uploadProject, uploadTask };
