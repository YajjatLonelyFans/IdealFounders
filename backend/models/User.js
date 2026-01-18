import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['founder', 'investor'],
            required: true,
        },
        fullName: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
        },
        lookingFor: {
            role: {
                type: String,
                default: '',
            },
            industry: {
                type: String,
                default: '',
            },
        },
        avatar: {
            url: {
                type: String,
                default: '',
            },
            publicId: {
                type: String,
                default: '',
            },
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;
