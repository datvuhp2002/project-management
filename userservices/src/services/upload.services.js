"use strict";

const { result } = require("lodash");
const cloudinary = require("../configs/cloudinary.config");
const { BadRequestError } = require("../core/error.response");
const { publicDecrypt } = require("crypto");
// 1.upload from url image

const uploadImageFromUrl = async ({ urlImage }, userId) => {
  console.log("URL:::", urlImage);
  try {
    const folderName = `avatar/${userId}`;
    const result = await cloudinary.uploader.upload(urlImage, {
      folder: folderName,
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

// // 2.upload image from local
const uploadImageFromLocal = async (path, userId) => {
  const folderName = `avatar/${userId}`;
  console.log("FolderName:::", folderName);
  try {
    const result = await cloudinary.uploader.upload(await path, {
      public_id: userId,
      folder: folderName,
    });
    return {
      image_url: result.secure_url,
      public_id: result.public_id,
      thumb_url: await cloudinary.url(result.public_id, {
        height: 100,
        width: 100,
        format: "jpg",
      }),
    };
  } catch (err) {
    console.log(err);
    throw new BadRequestError("Upload avatar không thành công");
  }
};
// // 3.upload image from local
const uploadImageFromLocalFiles = async (files, userId) => {
  const folderName = `avatar/${userId}`;
  try {
    console.log("Files::", files);
    const uploadedUrls = [];
    if (!files.length) return;
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        public_id: `${userId}-${file.size}`,
        folder: folderName,
      });
      uploadedUrls.push({
        image_url: result.secure_url,
        public_id: result.public_id,
        thumb_url: await cloudinary.url(result.public_id, {
          height: 100,
          width: 100,
          format: "jpg",
        }),
      });
    }
    return uploadedUrls;
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  uploadImageFromLocal,
  uploadImageFromUrl,
  uploadImageFromLocalFiles,
};
