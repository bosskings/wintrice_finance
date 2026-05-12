import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email address"]
  },

  picture: {
    type: String,
    default: "https://wintrice.com/avatar.jpeg"
  },
  grade: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  enrolled: {
    type: Boolean,
    default: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },

  quizzes: [
    {
      quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
      },
      dateTaken: {
        type: Date,
        required: true
      },
      score: {
        type: Number,
        required: true
      },
      completionTime: {
        type: Number, // in minutes
        required: true
      },
      result: {
        type: String,
        enum: ['PASSED', 'FAILED'],
        required: true
      }
    }
  ],

  courses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    status: {
      type: String,
      enum: ['COMPLETE', 'ONGOING'],
      default: 'ONGOING'
    }
  }],

  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  password:{
    type:String,
    required:true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
export default mongoose.model('Student', studentSchema);