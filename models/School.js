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
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    email: {
        type: String,
        unique: true,
        required:true
    },
    phone: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    accessId: {
        type: String,
        default: "0000000000"
    },
    authCode: {
        type: String,
        default: "000000"
    },
    schoolLogo: {
        type: String, // Can store a URL or base64 string to the logo image
        default: ""
    },
    colorTheme: {
        type: String,
        enum: ['black', 'blue'],
        default: 'blue'
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