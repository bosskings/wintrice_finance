import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },
    timeInMinutes: {
        type: Number,
        required: false,
        default:30
    },
    
    questions: [
        {
            question: {
                type: String,
                required: true
            },
            answers: {
                a: { type: String, required: true },
                b: { type: String, required: true },
                c: { type: String, required: true },
                d: { type: String, required: true }
            },
            correctAnswer: {
                type: String,
                enum: ['a', 'b', 'c', 'd'],
                required: true
            }
        }
    ],
    students: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
                required: true
            },
            score: {
                type: Number,
                required: true
            },
            completionTime: {
                type: Number, // Time in seconds, for example
                required: false
            },
            complete: {
                type: Boolean,
                default: false
            }
        }
    ],
    dateWritten: {
        type: Date,
        default: Date.now
    }

});
export default mongoose.model('Quiz', quizSchema);