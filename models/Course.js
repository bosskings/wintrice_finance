import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    courseCode: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    duration: {
        type: Number, // Duration in hours
        required: true,
        min: 1
    },
    coverImage: {
        type: String, // URL or file path
        required: false,
        trim: true
    },
    courseCode: {
        type: String,
        required: true,
        trim: true
    },
    gradeLevel: {
        type: String,
        required: true,
        trim: true
    },
    files: [
        {
            type: {
                type: String,
                enum: ['audio', 'video', 'pdf', 'word', 'text'],
                required: true
            },
            fileURL: {
                type: String,
                required: true,
                trim: true
            },
            fileUid:{
                type:String,
                required:true
            }
        }
    ],
    category: {
        type: String,
        enum: ['FINANCE', 'INVESTING', 'INTRO', 'BASICS', 'ACCOUNTING'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model('Course', courseSchema);