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

        const user = await User.findOne({ clerkId });

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


// Validation helpers
const validateString = (val, min, max, fieldName) => {
    if (!val || typeof val !== 'string') return `${fieldName} is required`;
    const trimmed = val.trim();
    if (trimmed.length < min) return `${fieldName} must be at least ${min} characters`;
    if (trimmed.length > max) return `${fieldName} must be at most ${max} characters`;
    return null;
};

const validateEnum = (val, allowed, fieldName) => {
    if (!val || !allowed.includes(val)) {
        return `${fieldName} must be one of: ${allowed.join(', ')}`;
    }
    return null;
};

const sanitizeString = (val) => {
    if (!val || typeof val !== 'string') return '';
    // Strip HTML tags and trim
    return val.replace(/<[^>]*>/g, '').trim();
};


export const onboardUser = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const {
            fullName, birthdate, gender, graduateStatus,
            location, education,
            expertise, expertiseLookingFor,
            bio, skills, skillsLookingFor,
            startingFrom, hasCofounder, suitability,
        } = req.body;

        // --- Input validation ---
        const errors = [];

        // fullName
        const nameErr = validateString(fullName, 2, 100, 'Full name');
        if (nameErr) errors.push(nameErr);

        // birthdate
        if (!birthdate) {
            errors.push('Birthdate is required');
        } else {
            const bd = new Date(birthdate);
            if (isNaN(bd.getTime())) {
                errors.push('Birthdate must be a valid date');
            } else {
                const age = (Date.now() - bd.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
                if (age < 13) errors.push('You must be at least 13 years old');
                if (age > 120) errors.push('Invalid birthdate');
            }
        }

        // gender
        const genderErr = validateEnum(gender, ['male', 'female'], 'Gender');
        if (genderErr) errors.push(genderErr);

        // graduateStatus
        const gradErr = validateEnum(graduateStatus, ['graduated', 'pursuing'], 'Graduate status');
        if (gradErr) errors.push(gradErr);

        // location — only required for graduates
        let parsedLocation = location;
        if (typeof location === 'string') {
            try { parsedLocation = JSON.parse(location); } catch { parsedLocation = {}; }
        }
        if (graduateStatus === 'graduated') {
            if (!parsedLocation || typeof parsedLocation !== 'object') {
                errors.push('Location is required for graduates');
            } else {
                const stateErr = validateString(parsedLocation.state, 2, 100, 'State');
                if (stateErr) errors.push(stateErr);
                const cityErr = validateString(parsedLocation.city, 2, 100, 'City');
                if (cityErr) errors.push(cityErr);
                const localityErr = validateString(parsedLocation.locality, 2, 100, 'Locality');
                if (localityErr) errors.push(localityErr);
            }
        }

        // expertise
        const expErr = validateEnum(expertise, ['technical', 'non-technical'], 'Expertise');
        if (expErr) errors.push(expErr);

        const expLookErr = validateEnum(expertiseLookingFor, ['technical', 'non-technical'], 'Expertise looking for');
        if (expLookErr) errors.push(expLookErr);

        // bio
        const bioErr = validateString(bio, 10, 500, 'Bio');
        if (bioErr) errors.push(bioErr);

        // skills
        let parsedSkills = skills;
        if (typeof skills === 'string') {
            try { parsedSkills = JSON.parse(skills); } catch { parsedSkills = skills.split(',').map((s) => s.trim()); }
        }
        if (!Array.isArray(parsedSkills) || parsedSkills.length < 1) {
            errors.push('At least 1 skill is required');
        }

        // skillsLookingFor
        let parsedSkillsLookingFor = skillsLookingFor;
        if (typeof skillsLookingFor === 'string') {
            try { parsedSkillsLookingFor = JSON.parse(skillsLookingFor); } catch { parsedSkillsLookingFor = skillsLookingFor.split(',').map((s) => s.trim()); }
        }
        if (!Array.isArray(parsedSkillsLookingFor) || parsedSkillsLookingFor.length < 1) {
            errors.push('At least 1 skill you are looking for is required');
        }

        // startingFrom
        const startErr = validateEnum(startingFrom, ['own_idea', 'join_idea', 'either'], 'Starting from');
        if (startErr) errors.push(startErr);

        // hasCofounder
        const parsedHasCofounder = typeof hasCofounder === 'string'
            ? hasCofounder === 'true'
            : Boolean(hasCofounder);
        if (hasCofounder === undefined || hasCofounder === null || hasCofounder === '') {
            errors.push('Co-founder status is required');
        }

        // suitability
        const suitErr = validateEnum(suitability, ['cofounder_with_idea', 'cofounder_looking', 'either'], 'Suitability');
        if (suitErr) errors.push(suitErr);

        // Return validation errors
        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: errors.join('; '),
                details: errors,
            });
        }

        // --- Process education (optional for graduates, shown for pursuing) ---
        let parsedEducation = education;
        if (typeof education === 'string') {
            try { parsedEducation = JSON.parse(education); } catch { parsedEducation = {}; }
        }
        const finalEducation = graduateStatus === 'pursuing' ? {
            collegeName: sanitizeString(parsedEducation?.collegeName) || 'N/A',
            degree: sanitizeString(parsedEducation?.degree) || 'N/A',
            yearOfPassing: sanitizeString(parsedEducation?.yearOfPassing) || 'N/A',
        } : {
            collegeName: 'N/A',
            degree: 'N/A',
            yearOfPassing: 'N/A',
        };

        // --- Process location (set N/A for pursuing students) ---
        const finalLocation = graduateStatus === 'graduated' ? {
            state: sanitizeString(parsedLocation?.state) || 'N/A',
            city: sanitizeString(parsedLocation?.city) || 'N/A',
            locality: sanitizeString(parsedLocation?.locality) || 'N/A',
        } : {
            state: 'N/A',
            city: 'N/A',
            locality: 'N/A',
        };

        // --- Fetch email from Clerk ---
        let userEmail = '';
        try {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || '';
        } catch (clerkError) {
            console.error('Error fetching Clerk user:', clerkError);
        }

        // --- Handle avatar ---
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

        // --- Build update data ---
        const updateData = {
            clerkId,
            email: userEmail || existingUser?.email || '',
            fullName: sanitizeString(fullName),
            birthdate: new Date(birthdate),
            gender,
            graduateStatus,
            location: finalLocation,
            education: finalEducation,
            expertise,
            expertiseLookingFor,
            bio: sanitizeString(bio),
            skills: parsedSkills.map((s) => sanitizeString(s)).filter(Boolean),
            skillsLookingFor: parsedSkillsLookingFor.map((s) => sanitizeString(s)).filter(Boolean),
            startingFrom,
            hasCofounder: parsedHasCofounder,
            suitability,
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
