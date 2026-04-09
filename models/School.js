import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },    
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'active'
    },
    settings: {
        enrolmentPolicy: {
            type: [String], // e.g. ['open', 'by-invitation', ...]
            default: []
        },
        permissions: {
            admin: {
                type: Boolean,
                default: false
            },
            student: {
                type: Boolean,
                default: true
            }
        },
        courses: [
            {
                name: { type: String, required: true },
                available: { type: Boolean, default: false }
            }
        ]
    }
});

export default mongoose.model('School', schoolSchema);