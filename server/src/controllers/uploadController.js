import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { randomUUID } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    cb(null, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype));
  },
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'automarket', format: 'webp', quality: 82, width: 1200, height: 900, crop: 'limit' },
      (err, result) => { if (err) reject(err); else resolve(result.secure_url); }
    );
    stream.end(buffer);
  });
}

async function saveLocally(file, req) {
  const { createWriteStream } = await import('fs');
  const filename = `${randomUUID()}.webp`;
  const dest = path.join('uploads', filename);
  const buffer = await sharp(file.buffer)
    .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await new Promise((resolve, reject) => {
    const ws = createWriteStream(dest);
    ws.on('finish', resolve);
    ws.on('error', reject);
    ws.end(buffer);
  });
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

export const uploadImages = async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: 'Niciun fișier valid primit (JPEG, PNG, WebP)' });
  }

  try {
    const urls = await Promise.all(
      req.files.map(async (file) => {
        if (useCloudinary) {
          const optimized = await sharp(file.buffer)
            .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();
          return uploadToCloudinary(optimized);
        }
        return saveLocally(file, req);
      })
    );
    res.json({ urls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Eroare la procesarea imaginilor.' });
  }
};
