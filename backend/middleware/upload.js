import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage with auto-resize to 400x400
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'matchmaking-avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            {
                width: 400,
                height: 400,
                crop: 'cover',
                quality: 'auto',
            },
        ],
    },
});

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB max file size
    },
});


export { upload, cloudinary };
