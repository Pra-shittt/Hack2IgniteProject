const mongoose = require('mongoose');

// Activated after TPO approval — tracks the live internship
const internshipRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
    // Assigned mentors
    collegeMentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    companyMentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Duration
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // Early-warning status (computed from deterministic rules)
    warningStatus: {
      type: String,
      enum: ['ON_TRACK', 'NEEDS_ATTENTION', 'AT_RISK'],
      default: 'ON_TRACK',
    },
    // Internship lifecycle status
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'TERMINATED'],
      default: 'ACTIVE',
    },
    // Final outcome after completion
    outcome: {
      type: String,
      enum: ['COMPLETED', 'PPO', 'EXTENDED', 'NO_OFFER'],
    },
    // Role and skills (for digital record)
    roleTitle: { type: String },
    skillsGained: [{ type: String }],
    certificateUrl: { type: String },
    // Overall progress (averaged from milestones)
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

internshipRecordSchema.index({ studentId: 1, status: 1 });
internshipRecordSchema.index({ companyMentorId: 1 });
internshipRecordSchema.index({ collegeMentorId: 1 });

module.exports = mongoose.model('InternshipRecord', internshipRecordSchema);
