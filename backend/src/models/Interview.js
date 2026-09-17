const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    round: { type: Number, default: 1 },
    roundName: { type: String, default: 'Round 1' }, // e.g. "Technical", "HR"
    scheduledAt: { type: Date, required: true },
    roomId: { type: String, required: true },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    notes: { type: String }, // interviewer notes
    evaluation: { type: String }, // basic evaluation
    duration: { type: Number, default: 60 }, // minutes
  },
  { timestamps: true }
);

interviewSchema.index({ studentId: 1 });
interviewSchema.index({ recruiterId: 1 });
interviewSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
