import { cloudinary } from '../middleware/upload.js';

export const deleteOldImage = async (publicId) => {
    if (!publicId) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Successfully deleted image: ${publicId}`);
    } catch (error) {
        console.error(`Failed to delete image ${publicId}:`, error.message);

    }
};
