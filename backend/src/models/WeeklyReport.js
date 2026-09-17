const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema(
  {
    internshipRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'InternshipRecord', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekNumber: { type: Number, required: true, min: 1 },
    // Report content (privacy-safe, no confidential data)
    workSummary: { type: String, required: true },
    skillsUsed: [{ type: String, trim: true }],
    learningOutcomes: { type: String },
    challenges: { type: String },
    achievements: { type: String },
    nextWeekGoals: { type: String },
    attendanceDays: { type: Number, min: 0, max: 7, default: 5 },
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
    // Workflow status
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'REVISION_REQUIRED', 'VERIFIED'],
      default: 'DRAFT',
    },
    submittedAt: { type: Date },
    // Mentor verification
    mentorComment: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    // AI confidentiality check result (embedded)
    confidentialityCheck: {
      riskLevel: { type: String, enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH'] },
      flaggedCategories: [{ type: String }],
      flaggedItems: [{ type: String }],
      suggestion: { type: String },
      checkedAt: { type: Date },
      skipped: { type: Boolean, default: false }, // if AI service unavailable
    },
  },
  { timestamps: true }
);

// Unique constraint: one report per week per internship
weeklyReportSchema.index({ internshipRecordId: 1, weekNumber: 1 }, { unique: true });
weeklyReportSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
