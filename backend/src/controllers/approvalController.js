const Approval = require('../models/Approval');
const InternshipRecord = require('../models/InternshipRecord');
const Offer = require('../models/Offer');

// GET /api/approvals — TPO sees pending approvals
const listApprovals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const approvals = await Approval.find(filter)
      .populate('offerId')
      .populate('studentId', 'name email')
      .populate('internshipId', 'title duration location')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: approvals, total: approvals.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/approvals/:id — TPO approves or rejects, issues NOC, activates internship
const reviewApproval = async (req, res) => {
  try {
    const { status, remarks, collegeMentorId, companyMentorId } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be APPROVED or REJECTED' });
    }

    const approval = await Approval.findById(req.params.id).populate('offerId');
    if (!approval) return res.status(404).json({ success: false, message: 'Approval not found' });
    if (approval.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Already reviewed' });
    }

    approval.status = status;
    approval.remarks = remarks;
    approval.reviewedBy = req.user._id;
    approval.reviewedAt = new Date();

    if (status === 'APPROVED') {
      approval.nocIssued = true;

      const offer = approval.offerId;

      // Create InternshipRecord — activates the internship
      await InternshipRecord.create({
        studentId: approval.studentId,
        internshipId: approval.internshipId,
        companyId: offer.companyId,
        offerId: offer._id,
        approvalId: approval._id,
        collegeMentorId: collegeMentorId || undefined,
        companyMentorId: companyMentorId || undefined,
        startDate: offer.joiningDate || new Date(),
        endDate: offer.joiningDate
          ? new Date(new Date(offer.joiningDate).getTime() + (parseInt(offer.duration) || 8) * 7 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        roleTitle: offer.internshipId?.title,
      });
    }

    await approval.save();
    res.json({ success: true, data: approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/approvals/my — Student sees their approval status
const getMyApproval = async (req, res) => {
  try {
    const approval = await Approval.findOne({ studentId: req.user._id })
      .populate('offerId')
      .populate('reviewedBy', 'name');
    res.json({ success: true, data: approval });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { listApprovals, reviewApproval, getMyApproval };
