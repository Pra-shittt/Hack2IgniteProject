const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    // Offer details
    joiningDate: { type: Date },
    stipend: { type: Number },
    duration: { type: String },
    location: { type: String },
    letterUrl: { type: String }, // Cloudinary URL for offer letter
    additionalNote: { type: String },
    // Status
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
      default: 'PENDING',
    },
    studentResponse: { type: Date }, // when student accepted/declined
  },
  { timestamps: true }
);

offerSchema.index({ studentId: 1 });
offerSchema.index({ internshipId: 1 });

module.exports = mongoose.model('Offer', offerSchema);
