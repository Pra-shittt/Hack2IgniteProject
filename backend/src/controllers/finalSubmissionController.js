const FinalSubmission = require('../models/FinalSubmission');
const InternshipRecord = require('../models/InternshipRecord');

// POST /api/final-submissions — student submits final work
const createSubmission = async (req, res) => {
  try {
    const { internshipRecordId, projectSummary, skillsLearned } = req.body;

    const record = await InternshipRecord.findById(internshipRecordId);
    if (!record) return res.status(404).json({ success: false, message: 'Internship record not found' });
    if (record.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your internship record' });
    }

    const existing = await FinalSubmission.findOne({ internshipRecordId });
    if (existing) return res.status(409).json({ success: false, message: 'Final submission already exists' });

    const submission = await FinalSubmission.create({
      internshipRecordId,
      studentId: req.user._id,
      projectSummary,
      skillsLearned: skillsLearned || [],
      finalReportUrl: req.body.finalReportUrl,
      presentationUrl: req.body.presentationUrl,
      certificateUrl: req.body.certificateUrl,
    });

    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/final-submissions/my — student gets their submission
const getMySubmission = async (req, res) => {
  try {
    const record = await InternshipRecord.findOne({ studentId: req.user._id });
    if (!record) return res.json({ success: true, data: null });

    const submission = await FinalSubmission.findOne({ internshipRecordId: record._id })
      .populate('companyEvaluation.evaluatedBy', 'name')
      .populate('collegeMentorReview.reviewedBy', 'name')
      .populate('tpoApproval.approvedBy', 'name');

    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/final-submissions/:id
const getSubmission = async (req, res) => {
  try {
    const submission = await FinalSubmission.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('internshipRecordId');
    if (!submission) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/final-submissions — TPO/mentors list all
const listSubmissions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const submissions = await FinalSubmission.find(filter)
      .populate('studentId', 'name email')
      .populate('internshipRecordId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: submissions, total: submissions.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/final-submissions/:id/evaluate — company mentor evaluates
const evaluateSubmission = async (req, res) => {
  try {
    const { participation, professionalism, technicalLearning, communication, overallRating, feedback } = req.body;

    const submission = await FinalSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Not found' });

    submission.companyEvaluation = {
      participation, professionalism, technicalLearning, communication, overallRating, feedback,
      evaluatedBy: req.user._id,
      evaluatedAt: new Date(),
    };
    submission.status = 'COMPANY_EVALUATED';
    await submission.save();

    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/final-submissions/:id/college-review — college mentor reviews
const collegeReview = async (req, res) => {
  try {
    const { recommendation } = req.body;

    const submission = await FinalSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Not found' });

    submission.collegeMentorReview = {
      recommendation,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    };
    submission.status = 'COLLEGE_REVIEWED';
    await submission.save();

    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/final-submissions/:id/tpo-approve — TPO final approval
const tpoApprove = async (req, res) => {
  try {
    const { status: approvalStatus, remarks } = req.body;

    const submission = await FinalSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: 'Not found' });

    submission.tpoApproval = {
      status: approvalStatus,
      remarks,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    };

    if (approvalStatus === 'APPROVED') {
      submission.status = 'COMPLETED';
      // Mark internship record as completed
      await InternshipRecord.findByIdAndUpdate(submission.internshipRecordId, { status: 'COMPLETED' });
    }

    await submission.save();
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createSubmission, getMySubmission, getSubmission, listSubmissions, evaluateSubmission, collegeReview, tpoApprove };
