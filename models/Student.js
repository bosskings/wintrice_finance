import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  grade: {
    type: String,
    required: true
  },
  enrolled: {
    type: Boolean,
    default: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },

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
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
export default mongoose.model('Student', studentSchema);