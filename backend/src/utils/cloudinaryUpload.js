const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (buffer, folder = 'resumes', resourceType = 'raw', originalName = '') => {
  // Check if Cloudinary is realistically configured
  const hasCloudinary = 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_KEY !== 'your-api-key' &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name';

  if (hasCloudinary) {
    try {
      return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `internship-system/${folder}`, resource_type: resourceType },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });
    } catch (cloudErr) {
      console.warn('⚠️ Cloudinary upload failed, falling back to local storage:', cloudErr.message);
    }
  }

  // Fallback: Store locally
  try {
    const uploadDir = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = originalName ? path.extname(originalName) || '.pdf' : '.pdf';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const port = process.env.PORT || 5000;
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
    const secure_url = `${baseUrl}/uploads/${folder}/${filename}`;

    return { secure_url, public_id: filename };
  } catch (localErr) {
    console.error('Local file save failed:', localErr);
    throw new Error('Failed to save file');
  }
};

module.exports = { uploadToCloudinary };
