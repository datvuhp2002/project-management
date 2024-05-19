"use strict";

// Require the cloudinary library
const cloudinary = require("cloudinary").v2;

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: "lachongtech",
  api_key: "631518346949312",
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  sign_url: true,
});

console.log(cloudinary.config());
// Log the configuration
module.exports = cloudinary;
