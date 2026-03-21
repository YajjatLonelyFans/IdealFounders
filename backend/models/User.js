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
        fullName: {
            type: String,
            default: 'N/A',
        },
        birthdate: {
            type: Date,
            default: null,
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            default: 'male',
        },
        graduateStatus: {
            type: String,
            enum: ['graduated', 'pursuing'],
            default: 'graduated',
        },
        location: {
            state: {
                type: String,
                default: 'N/A',
            },
            city: {
                type: String,
                default: 'N/A',
            },
            locality: {
                type: String,
                default: 'N/A',
            },
        },
        education: {
            collegeName: {
                type: String,
                default: 'N/A',
            },
            degree: {
                type: String,
                default: 'N/A',
            },
            yearOfPassing: {
                type: String,
                default: 'N/A',
            },
        },
        expertise: {
            type: String,
            enum: ['technical', 'non-technical'],
            default: 'technical',
        },
        expertiseLookingFor: {
            type: String,
            enum: ['technical', 'non-technical'],
            default: 'technical',
        },
        bio: {
            type: String,
            default: '',
        },
        skills: {
            type: [String],
            default: [],
        },
        skillsLookingFor: {
            type: [String],
            default: [],
        },
        startingFrom: {
            type: String,
            enum: ['own_idea', 'join_idea', 'either'],
            default: 'either',
        },
        hasCofounder: {
            type: Boolean,
            default: false,
        },
        suitability: {
            type: String,
            enum: ['cofounder_with_idea', 'cofounder_looking', 'either'],
            default: 'either',
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
