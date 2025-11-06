import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload 1 file theo đường dẫn tạm của multer, trả về secure_url + public_id
export async function uploadToCloudinary(filePath, folder = "products") {
  if (!filePath) throw new Error("Missing file path for upload");
  const res = await cloudinary.uploader.upload(filePath, { folder });
  return { url: res.secure_url || res.url, public_id: res.public_id };
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;