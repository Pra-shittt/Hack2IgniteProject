const mongoose = require('mongoose');

const eligibilitySchema = new mongoose.Schema({
  minCgpa: { type: Number },
  allowedBranches: [{ type: String }],
  allowedYears: [{ type: Number }],
  description: { type: String },
}, { _id: false });

const internshipSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    skills: [{ type: String, trim: true }],
    eligibility: { type: eligibilitySchema, default: {} },
    location: { type: String },
    stipend: { type: Number },
    duration: { type: String }, // e.g. "2 months"
    applicationDeadline: { type: Date },
    status: { type: String, enum: ['DRAFT', 'OPEN', 'CLOSED'], default: 'OPEN' },
    // Preparation Hub content
    preparationTips: [{ type: String }],
    technicalQuestions: [{ type: String }],
    hrQuestions: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes
internshipSchema.index({ status: 1, applicationDeadline: 1 });
internshipSchema.index({ companyId: 1 });

module.exports = mongoose.model('Internship', internshipSchema);
