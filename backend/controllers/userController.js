import User from '../models/User.js';
import { deleteOldImage } from '../functionality/imageCleaner.js';
import { clerkClient } from '@clerk/express';


export const getMe = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete onboarding first',
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch user profile',
        });
    }
};


export const getUserByClerkId = async (req, res) => {
    try {
        const { clerkId } = req.params;
        console.log(`Backend Looking up user with clerkId: [${clerkId}]`);

        const user = await User.findOne({ clerkId });

        if (user) {
            console.log(`✅ Found user: ${user.fullName} (${user._id})`);
        } else {
            console.log(`❌ User not found for clerkId: [${clerkId}]`);
        }

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User profile does not exist',
            });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error fetching user by Clerk ID:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch user profile',
        });
    }
};


export const onboardUser = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const { fullName, bio, role, skills, lookingFor } = req.body;

        // Fetch user email from Clerk
        let userEmail = '';
        try {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || '';
        } catch (clerkError) {
            console.error('Error fetching Clerk user:', clerkError);
        }

        // Parse skills if it's a string
        let parsedSkills = skills;
        if (typeof skills === 'string') {
            try {
                parsedSkills = JSON.parse(skills);
            } catch (e) {
                parsedSkills = skills.split(',').map((s) => s.trim());
            }
        }


        let parsedLookingFor = lookingFor;
        if (typeof lookingFor === 'string') {
            try {
                parsedLookingFor = JSON.parse(lookingFor);
            } catch (e) {
                parsedLookingFor = { role: '', industry: '' };
            }
        }


        const existingUser = await User.findOne({ clerkId });


        let avatarData = existingUser?.avatar || { url: '', publicId: '' };


        if (req.file) {

            if (existingUser?.avatar?.publicId) {
                await deleteOldImage(existingUser.avatar.publicId);
            }


            avatarData = {
                url: req.file.path,
                publicId: req.file.filename,
            };
        }


        const updateData = {
            clerkId,
            email: userEmail || existingUser?.email || '',
            fullName: fullName || existingUser?.fullName || '',
            bio: bio || existingUser?.bio || '',
            role: role || existingUser?.role,
            skills: parsedSkills || existingUser?.skills || [],
            lookingFor: parsedLookingFor || existingUser?.lookingFor || { role: '', industry: '' },
            avatar: avatarData,
        };


        const user = await User.findOneAndUpdate(
            { clerkId },
            updateData,
            { new: true, upsert: true, runValidators: true }
        );

        res.json({
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        console.error('Error onboarding user:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update profile',
            details: error.message,
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No profile exists to delete',
            });
        }

        // Delete avatar from Cloudinary
        if (user.avatar?.publicId) {
            await deleteOldImage(user.avatar.publicId);
        }

        // Delete user from MongoDB
        await User.deleteOne({ clerkId });

        // Delete user from Clerk
        try {
            await clerkClient.users.deleteUser(clerkId);
        } catch (clerkError) {
            console.error('Error deleting Clerk user:', clerkError);
            // Continue even if Clerk deletion fails
        }

        res.json({
            message: 'Profile deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete profile',
        });
    }
};
