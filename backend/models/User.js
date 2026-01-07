import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['founder', 'investor'],
        required: [true, 'Role is required']
    },
    bio: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export const User = mongoose.model('User', userSchema);
