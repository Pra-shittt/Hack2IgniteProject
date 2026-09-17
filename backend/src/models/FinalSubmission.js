const mongoose = require('mongoose');

const finalSubmissionSchema = new mongoose.Schema(
  {
    internshipRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'InternshipRecord', required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Submission content
    finalReportUrl: { type: String },    // Cloudinary URL
    presentationUrl: { type: String },   // Cloudinary URL
    projectSummary: { type: String },
    skillsLearned: [{ type: String }],
    certificateUrl: { type: String },    // Company-issued certificate
    // Workflow status
    status: {
      type: String,
      enum: ['SUBMITTED', 'COMPANY_EVALUATED', 'COLLEGE_REVIEWED', 'TPO_APPROVED', 'COMPLETED'],
      default: 'SUBMITTED',
    },
    submittedAt: { type: Date, default: Date.now },
    // Company Mentor evaluation
    companyEvaluation: {
      participation: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 },
      technicalLearning: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      overallRating: { type: Number, min: 1, max: 5 },
      feedback: { type: String },
      evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      evaluatedAt: { type: Date },
    },
    // College Mentor review
    collegeMentorReview: {
      recommendation: { type: String },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewedAt: { type: Date },
    },
    // TPO final approval
    tpoApproval: {
      status: { type: String, enum: ['APPROVED', 'CORRECTION_REQUIRED'] },
      remarks: { type: String },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinalSubmission', finalSubmissionSchema);
