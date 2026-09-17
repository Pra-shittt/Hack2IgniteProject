const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (buffer, folder, resourceType = 'raw') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `internship-system/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { uploadToCloudinary };
