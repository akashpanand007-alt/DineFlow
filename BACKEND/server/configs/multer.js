import pkg from "cloudinary";
const { v2: cloudinary } = pkg;

import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary before using it
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",        // Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

// Export multer middleware
export const uploadCloud = multer({ storage });
