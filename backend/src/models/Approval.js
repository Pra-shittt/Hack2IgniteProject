const mongoose = require('mongoose');

// TPO approval of an offer / NOC issuance
const approvalSchema = new mongoose.Schema(
  {
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // TPO user
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    nocIssued: { type: Boolean, default: false },
    nocUrl: { type: String }, // Cloudinary URL for NOC document
    remarks: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

approvalSchema.index({ studentId: 1 });
approvalSchema.index({ status: 1 });

module.exports = mongoose.model('Approval', approvalSchema);
