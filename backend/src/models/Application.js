const mongoose = require('mongoose');

const APPLICATION_STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'OFFERED'];

const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'APPLIED' },
    appliedAt: { type: Date, default: Date.now },
    recruiterRemarks: { type: String },
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });
applicationSchema.index({ internshipId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.APPLICATION_STATUSES = APPLICATION_STATUSES;
