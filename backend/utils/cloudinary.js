// backend/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Export mặc định để có thể import cloudinary từ nơi khác
export default cloudinary;

// ✅ Export thêm hàm upload để dùng riêng khi cần
export const uploadToCloudinary = async (filePath, folder = "FoodFast") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // hỗ trợ ảnh, video, file
    });
    return result.secure_url; // URL ảnh sau khi upload
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    throw new Error("Không thể upload ảnh lên Cloudinary");
  }
};
