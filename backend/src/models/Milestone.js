const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    internshipRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'InternshipRecord', required: true },
    companyMentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date },
    // 0–100 percentage
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

milestoneSchema.index({ internshipRecordId: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);
