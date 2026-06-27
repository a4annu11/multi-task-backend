import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const deleteLocalFile = async (localFilePath) => {
  try {
    if (localFilePath && fs.existsSync(localFilePath)) {
      await fs.promises.unlink(localFilePath);
    }
  } catch (error) {
    // ignore cleanup failures
  }
};

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    return response;
  } finally {
    await deleteLocalFile(localFilePath);
  }
};

const uploadMedia = async (files) => {
  if (!files) return null;

  const fileList = Array.isArray(files) ? files : [files];
  const uploaded = await Promise.all(
    fileList.map(async (file) => {
      if (!file?.path) return null;
      const response = await uploadOnCloudinary(file.path);
      if (!response) return null;
      return {
        url: response.secure_url || response.url,
        publicId: response.public_id,
      };
    }),
  );

  const validUploads = uploaded.filter(Boolean);
  return Array.isArray(files) ? validUploads : validUploads[0] || null;
};

const destroyMedia = async (publicId) => {
  if (!publicId) return null;

  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });
  } catch (error) {
    return null;
  }
};

export { cloudinary, uploadOnCloudinary, uploadMedia, destroyMedia };
