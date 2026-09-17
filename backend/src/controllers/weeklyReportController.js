const WeeklyReport = require('../models/WeeklyReport');
const InternshipRecord = require('../models/InternshipRecord');
const { checkConfidentiality } = require('../utils/confidentialityGuard');

// POST /api/weekly-reports — student submits a new report
const submitReport = async (req, res) => {
  try {
    const { internshipRecordId, weekNumber, workSummary, skillsUsed, learningOutcomes,
      challenges, achievements, nextWeekGoals, attendanceDays, progressPercent } = req.body;

    // Ownership check
    const record = await InternshipRecord.findById(internshipRecordId);
    if (!record) return res.status(404).json({ success: false, message: 'Internship record not found' });
    if (record.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your internship record' });
    }

    // Check for existing report for this week
    const existing = await WeeklyReport.findOne({ internshipRecordId, weekNumber });
    if (existing && existing.status !== 'REVISION_REQUIRED') {
      return res.status(409).json({ success: false, message: `Week ${weekNumber} report already submitted` });
    }

    // Run AI confidentiality check on the work summary
    const textToCheck = [workSummary, learningOutcomes, challenges, achievements].filter(Boolean).join('\n');
    const confidentialityResult = await checkConfidentiality(textToCheck);

    const reportData = {
      internshipRecordId,
      studentId: req.user._id,
      weekNumber,
      workSummary,
      skillsUsed: skillsUsed || [],
      learningOutcomes,
      challenges,
      achievements,
      nextWeekGoals,
      attendanceDays: attendanceDays ?? 5,
      progressPercent: progressPercent ?? 0,
      status: 'SUBMITTED',
      submittedAt: new Date(),
      confidentialityCheck: confidentialityResult,
    };

    let report;
    if (existing) {
      // Resubmission after revision request
      Object.assign(existing, reportData);
      report = await existing.save();
    } else {
      report = await WeeklyReport.create(reportData);
    }

    res.status(201).json({
      success: true,
      data: report,
      confidentialityWarning: confidentialityResult.riskLevel !== 'SAFE' ? confidentialityResult : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/weekly-reports/draft — student saves draft (no AI check)
const saveDraft = async (req, res) => {
  try {
    const { internshipRecordId, weekNumber, ...fields } = req.body;

    const record = await InternshipRecord.findById(internshipRecordId);
    if (!record || record.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const existing = await WeeklyReport.findOne({ internshipRecordId, weekNumber });
    let report;
    if (existing && existing.status === 'DRAFT') {
      Object.assign(existing, fields);
      report = await existing.save();
    } else if (!existing) {
      report = await WeeklyReport.create({
        internshipRecordId,
        studentId: req.user._id,
        weekNumber,
        workSummary: fields.workSummary || '',
        ...fields,
        status: 'DRAFT',
      });
    } else {
      return res.status(400).json({ success: false, message: 'Cannot save as draft — report already submitted' });
    }

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/weekly-reports — list reports (filtered by internship record)
const listReports = async (req, res) => {
  try {
    const { internshipRecordId, status } = req.query;
    const filter = {};
    if (internshipRecordId) filter.internshipRecordId = internshipRecordId;
    if (status) filter.status = status;
    // Students only see their own reports
    if (req.user.role === 'STUDENT') filter.studentId = req.user._id;

    const reports = await WeeklyReport.find(filter)
      .populate('studentId', 'name email')
      .populate('verifiedBy', 'name')
      .sort({ weekNumber: -1 });

    res.json({ success: true, data: reports, total: reports.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/weekly-reports/:id — get single report
const getReport = async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('verifiedBy', 'name');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/weekly-reports/:id/verify — company mentor verifies or requests revision
const verifyReport = async (req, res) => {
  try {
    const { action, comment } = req.body; // action: 'VERIFY' | 'REVISION'

    const report = await WeeklyReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    if (report.status !== 'SUBMITTED') {
      return res.status(400).json({ success: false, message: 'Report must be SUBMITTED to verify' });
    }

    if (action === 'VERIFY') {
      report.status = 'VERIFIED';
      report.verifiedBy = req.user._id;
      report.verifiedAt = new Date();
    } else if (action === 'REVISION') {
      report.status = 'REVISION_REQUIRED';
    } else {
      return res.status(400).json({ success: false, message: 'action must be VERIFY or REVISION' });
    }

    if (comment) report.mentorComment = comment;
    await report.save();

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitReport, saveDraft, listReports, getReport, verifyReport };
