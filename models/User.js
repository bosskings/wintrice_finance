import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: [true, "Email must be unique"],
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email address"]
  },
  
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinanceRecord'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);