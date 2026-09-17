const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    college: { type: String, trim: true },
    department: { type: String, trim: true },
    year: { type: Number, min: 1, max: 6 },
    enrollmentNumber: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    resumeUrl: { type: String },
    bio: { type: String, maxlength: 500 },
    cgpa: { type: Number, min: 0, max: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
