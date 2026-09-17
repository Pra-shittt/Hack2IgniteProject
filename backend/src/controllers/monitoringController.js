const InternshipRecord = require('../models/InternshipRecord');
const WeeklyReport = require('../models/WeeklyReport');
const Milestone = require('../models/Milestone');

/**
 * Compute early-warning status for a single InternshipRecord using deterministic rules.
 * Returns 'ON_TRACK' | 'NEEDS_ATTENTION' | 'AT_RISK'
 */
async function computeWarningStatus(record) {
  const now = new Date();
  const signals = [];

  // 1. Weeks elapsed since start
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksElapsed = Math.floor((now - record.startDate) / msPerWeek);

  if (weeksElapsed > 0) {
    // How many reports submitted/verified?
    const reports = await WeeklyReport.find({ internshipRecordId: record._id });
    const submittedCount = reports.filter(r => ['SUBMITTED', 'VERIFIED'].includes(r.status)).length;
    const verifiedCount = reports.filter(r => r.status === 'VERIFIED').length;
    const revisionCount = reports.filter(r => r.status === 'REVISION_REQUIRED').length;

    // Missing reports
    const missing = weeksElapsed - submittedCount;
    if (missing >= 3) signals.push('AT_RISK');        // 3+ weeks with no report
    else if (missing >= 1) signals.push('NEEDS_ATTENTION');

    // Pending mentor verification
    const pendingVerification = reports.filter(r => r.status === 'SUBMITTED').length;
    if (pendingVerification >= 3) signals.push('NEEDS_ATTENTION');

    // Repeated revisions
    if (revisionCount >= 3) signals.push('NEEDS_ATTENTION');

    // Attendance check
    if (reports.length > 0) {
      const avgAttendance = reports.reduce((s, r) => s + (r.attendanceDays || 5), 0) / reports.length;
      if (avgAttendance < 3) signals.push('AT_RISK');
      else if (avgAttendance < 4) signals.push('NEEDS_ATTENTION');
    }
  }

  // 2. Milestone progress
  const milestones = await Milestone.find({ internshipRecordId: record._id });
  if (milestones.length > 0) {
    const overdueMilestones = milestones.filter(
      m => m.dueDate && m.dueDate < now && m.status !== 'COMPLETED'
    );
    if (overdueMilestones.length >= 2) signals.push('AT_RISK');
    else if (overdueMilestones.length === 1) signals.push('NEEDS_ATTENTION');
  }

  // 3. Nearing end without completion
  const daysToEnd = (record.endDate - now) / (24 * 60 * 60 * 1000);
  if (daysToEnd < 14 && daysToEnd > 0) {
    const hasRecentReport = await WeeklyReport.findOne({
      internshipRecordId: record._id,
      status: 'VERIFIED',
      submittedAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    });
    if (!hasRecentReport) signals.push('NEEDS_ATTENTION');
  }

  if (signals.includes('AT_RISK')) return 'AT_RISK';
  if (signals.includes('NEEDS_ATTENTION')) return 'NEEDS_ATTENTION';
  return 'ON_TRACK';
}

// GET /api/monitoring — TPO monitoring dashboard
const getMonitoringDashboard = async (req, res) => {
  try {
    const records = await InternshipRecord.find({ status: 'ACTIVE' })
      .populate('studentId', 'name email')
      .populate('internshipId', 'title duration')
      .populate('companyId', 'name')
      .populate('collegeMentorId', 'name')
      .populate('companyMentorId', 'name');

    // Compute and update warning status for each
    const enriched = await Promise.all(
      records.map(async (record) => {
        const warningStatus = await computeWarningStatus(record);

        // Persist updated warning status
        if (record.warningStatus !== warningStatus) {
          await InternshipRecord.findByIdAndUpdate(record._id, { warningStatus });
        }

        // Get latest report info
        const latestReport = await WeeklyReport.findOne({ internshipRecordId: record._id })
          .sort({ weekNumber: -1 });

        const milestoneCount = await Milestone.countDocuments({ internshipRecordId: record._id });
        const completedMilestones = await Milestone.countDocuments({
          internshipRecordId: record._id,
          status: 'COMPLETED',
        });

        return {
          ...record.toObject(),
          warningStatus,
          latestReport: latestReport
            ? { weekNumber: latestReport.weekNumber, status: latestReport.status, submittedAt: latestReport.submittedAt }
            : null,
          milestoneProgress: milestoneCount > 0
            ? Math.round((completedMilestones / milestoneCount) * 100)
            : null,
        };
      })
    );

    // Summary stats
    const summary = {
      total: enriched.length,
      onTrack: enriched.filter(r => r.warningStatus === 'ON_TRACK').length,
      needsAttention: enriched.filter(r => r.warningStatus === 'NEEDS_ATTENTION').length,
      atRisk: enriched.filter(r => r.warningStatus === 'AT_RISK').length,
    };

    res.json({ success: true, data: enriched, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/monitoring/student/:studentId — detailed view for one student
const getStudentMonitoring = async (req, res) => {
  try {
    const record = await InternshipRecord.findOne({ studentId: req.params.studentId })
      .populate('studentId', 'name email')
      .populate('internshipId')
      .populate('companyId')
      .populate('collegeMentorId', 'name email')
      .populate('companyMentorId', 'name email');

    if (!record) return res.status(404).json({ success: false, message: 'No active internship for this student' });

    const reports = await WeeklyReport.find({ internshipRecordId: record._id }).sort({ weekNumber: 1 });
    const milestones = await Milestone.find({ internshipRecordId: record._id }).sort({ createdAt: 1 });
    const warningStatus = await computeWarningStatus(record);

    res.json({ success: true, data: { record, reports, milestones, warningStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMonitoringDashboard, getStudentMonitoring, computeWarningStatus };
