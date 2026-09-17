const InternshipRecord = require('../models/InternshipRecord');
const Milestone = require('../models/Milestone');
const WeeklyReport = require('../models/WeeklyReport');

// ─── Internship Record ────────────────────────────────────────────────────────

// GET /api/internship-records/my — student gets their active record
const getMyRecord = async (req, res) => {
  try {
    const record = await InternshipRecord.findOne({ studentId: req.user._id })
      .populate('internshipId', 'title description skills duration stipend location')
      .populate('companyId', 'name logo website')
      .populate('collegeMentorId', 'name email')
      .populate('companyMentorId', 'name email');
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/internship-records — TPO lists all active records
const listRecords = async (req, res) => {
  try {
    const { status, warningStatus } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (warningStatus) filter.warningStatus = warningStatus;

    const records = await InternshipRecord.find(filter)
      .populate('studentId', 'name email')
      .populate('internshipId', 'title duration')
      .populate('companyId', 'name')
      .populate('collegeMentorId', 'name')
      .populate('companyMentorId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: records, total: records.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/internship-records/:id — get single record with full details
const getRecord = async (req, res) => {
  try {
    const record = await InternshipRecord.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('internshipId')
      .populate('companyId')
      .populate('collegeMentorId', 'name email')
      .populate('companyMentorId', 'name email');
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/internship-records/:id/assign-mentor — TPO assigns mentors
const assignMentor = async (req, res) => {
  try {
    const { collegeMentorId, companyMentorId } = req.body;
    const record = await InternshipRecord.findByIdAndUpdate(
      req.params.id,
      { collegeMentorId, companyMentorId },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Milestones ────────────────────────────────────────────────────────────────

// POST /api/internship-records/:id/milestones — company mentor creates milestone
const createMilestone = async (req, res) => {
  try {
    const record = await InternshipRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    const milestone = await Milestone.create({
      internshipRecordId: req.params.id,
      companyMentorId: req.user._id,
      ...req.body,
    });
    res.status(201).json({ success: true, data: milestone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/internship-records/:id/milestones
const getMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ internshipRecordId: req.params.id }).sort({ createdAt: 1 });
    res.json({ success: true, data: milestones });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/milestones/:id — company mentor updates progress
const updateMilestone = async (req, res) => {
  try {
    const { progress, status, completedAt } = req.body;
    const updates = { progress, status };
    if (status === 'COMPLETED') updates.completedAt = completedAt || new Date();

    const milestone = await Milestone.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    // Recalculate overall record progress from milestones
    const allMilestones = await Milestone.find({ internshipRecordId: milestone.internshipRecordId });
    if (allMilestones.length > 0) {
      const avgProgress = Math.round(allMilestones.reduce((sum, m) => sum + m.progress, 0) / allMilestones.length);
      await InternshipRecord.findByIdAndUpdate(milestone.internshipRecordId, { progressPercent: avgProgress });
    }

    res.json({ success: true, data: milestone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMyRecord,
  listRecords,
  getRecord,
  assignMentor,
  createMilestone,
  getMilestones,
  updateMilestone,
};
