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

// 2.upload image from local
// const uploadAvatarFromLocal = async (path, userId) => {
//   const folderName = `avatar/${userId}`;
//   console.log("FolderName:::", folderName);
//   try {
//     const result = await cloudinary.uploader.upload(await path, {
//       public_id: userId,
//       folder: folderName,
//     });
//     return {
//       image_url: result.secure_url,
//       public_id: result.public_id,
//       thumb_url: await cloudinary.url(result.public_id, {
//         height: 100,
//         width: 100,
//         format: "jpg",
//       }),
//     };
//   } catch (err) {
//     console.error("Error uploading avatar to cloudinary:", err);
//     throw new BadRequestError("Upload avatar không thành công");
//   }
// };
// const uploadAvatarFromLocal = async ({ userId, path }) => {
//   const folderName = `avatar/${userId}`;
//   console.log("FolderName:::", folderName);
//   try {
//     const result = await cloudinary.uploader.upload(path, {
//       public_id: userId,
//       folder: folderName,
//     });
//     return {
//       image_url: result.secure_url,
//       public_id: result.public_id,
//       thumb_url: await cloudinary.url(result.public_id, {
//         height: 100,
//         width: 100,
//         format: "jpg",
//       }),
//     };
//   } catch (err) {
//     console.error("Error uploading avatar to cloudinary:", err);
//     throw new BadRequestError("Upload avatar không thành công");
//   }
// };

const uploadAvatarFromLocal = async ({ userId, path }) => {
  const folderName = `avatar/${userId}`;
  console.log("FolderName:::", folderName);
  try {
    if (!path) {
      throw new BadRequestError("Missing required parameter - path");
    }
    const result = await cloudinary.uploader.upload(path, {
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
    console.error("Error uploading avatar to cloudinary:", err);
    throw new BadRequestError("Upload avatar không thành công");
  }
};

module.exports = {
  uploadAvatarFromLocal,
};

// // // 3.upload image from local
// const uploadAvatarFromLocalFiles = async (files, userId) => {
//   const folderName = `avatar/${userId}`;
//   try {
//     console.log("Files::", files);
//     const uploadedUrls = [];
//     if (!files.length) return;
//     for (const file of files) {
//       const result = await cloudinary.uploader.upload(file.path, {
//         public_id: `${userId}-${file.size}`,
//         folder: folderName,
//       });
//       uploadedUrls.push({
//         image_url: result.secure_url,
//         public_id: result.public_id,
//         thumb_url: await cloudinary.url(result.public_id, {
//           height: 100,
//           width: 100,
//           format: "jpg",
//         }),
//       });
//     }
//     return uploadedUrls;
//   } catch (err) {
//     console.log(err);
//   }
// };
const uploadAvatarFromLocalFiles = async (files, userId) => {
  const folderName = `avatar/${userId}`;
  try {
    console.log("Files::", files);
    const uploadedUrls = [];

    // Kiểm tra nếu không có file nào trong mảng thì không làm gì cả
    if (!files || files.length === 0) {
      return uploadedUrls; // Trả về mảng rỗng nếu không có file nào
    }

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        public_id: `${userId}-${file.size}`, // Tạo public_id dựa trên userId và kích thước file
        folder: folderName, // Đường dẫn thư mục trên Cloudinary
      });

      // Tạo đối tượng mới chứa thông tin về URL của hình ảnh và thumbnail
      const uploadedImage = {
        image_url: result.secure_url,
        public_id: result.public_id,
        thumb_url: await cloudinary.url(result.public_id, {
          height: 100,
          width: 100,
          format: "jpg",
        }),
      };

      // Đẩy đối tượng vào mảng uploadedUrls
      uploadedUrls.push(uploadedImage);
    }

    return uploadedUrls; // Trả về mảng các đối tượng đã tải lên thành công
  } catch (err) {
    console.error("Error uploading avatar to cloudinary:", err);
    throw new BadRequestError("Upload avatar không thành công");
  }
};

// // 4.upload file
const uploadFile = async (project_id, { path, filename }) => {
  const existingProject = await prisma.project.findUnique({
    where: { project_id },
  });
  if (!existingProject) throw new BadRequestError("Dự án không tồn tại");
  try {
    const uploadFile = await prisma.project.update({
      where: { project_id },
      data: {
        document: [...existingProject.document, filename],
      },
    });
    if (uploadFile) return true;
    cloudinary.uploader.destroy(filename);
    return false;
  } catch (e) {
    throw new BadRequestError(`Đã sảy ra lỗi: ${e.message}`);
  }
};

module.exports = {
  uploadAvatarFromLocal,
  uploadImageFromUrl,
  uploadAvatarFromLocalFiles,
  uploadFile,
};
