const InternshipRecord = require('../models/InternshipRecord');
const FinalSubmission = require('../models/FinalSubmission');
const WeeklyReport = require('../models/WeeklyReport');
const Milestone = require('../models/Milestone');

// GET /api/digital-record/my — student views their completed digital internship record
const getMyDigitalRecord = async (req, res) => {
  try {
    const record = await InternshipRecord.findOne({ studentId: req.user._id })
      .populate('studentId', 'name email')
      .populate('internshipId', 'title description skills duration stipend location')
      .populate('companyId', 'name logo website')
      .populate('collegeMentorId', 'name email')
      .populate('companyMentorId', 'name email');

    if (!record) return res.json({ success: true, data: null });

    const finalSubmission = await FinalSubmission.findOne({ internshipRecordId: record._id });
    const reports = await WeeklyReport.find({ internshipRecordId: record._id, status: 'VERIFIED' });
    const milestones = await Milestone.find({ internshipRecordId: record._id });

    // Derive learning journey from skills used in verified reports
    const skillsMap = {};
    for (const r of reports) {
      for (const skill of (r.skillsUsed || [])) {
        skillsMap[skill] = (skillsMap[skill] || 0) + 1;
      }
    }
    const learningJourney = Object.entries(skillsMap)
      .sort((a, b) => b[1] - a[1])
      .map(([skill, count]) => ({ skill, weeksUsed: count }));

    // Attendance summary
    const totalAttendanceDays = reports.reduce((s, r) => s + (r.attendanceDays || 0), 0);
    const totalPossibleDays = reports.length * 5;

    const digitalRecord = {
      internshipRecord: record,
      finalSubmission,
      stats: {
        totalReports: reports.length,
        milestonesCompleted: milestones.filter(m => m.status === 'COMPLETED').length,
        totalMilestones: milestones.length,
        attendancePercent: totalPossibleDays > 0 ? Math.round((totalAttendanceDays / totalPossibleDays) * 100) : 0,
      },
      learningJourney,
      company: {
        name: record.companyId?.name,
        logo: record.companyId?.logo,
        website: record.companyId?.website,
      },
      role: record.internshipId?.title,
      skills: finalSubmission?.skillsLearned || learningJourney.map(l => l.skill),
      startDate: record.startDate,
      endDate: record.endDate,
      status: record.status,
      certificateUrl: finalSubmission?.certificateUrl,
      evaluation: finalSubmission?.companyEvaluation,
      outcome: record.outcome,
    };

    res.json({ success: true, data: digitalRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/digital-record/student/:studentId — TPO/mentor views student's digital record
const getStudentDigitalRecord = async (req, res) => {
  try {
    const record = await InternshipRecord.findOne({ studentId: req.params.studentId })
      .populate('studentId', 'name email')
      .populate('internshipId', 'title duration')
      .populate('companyId', 'name')
      .populate('collegeMentorId', 'name')
      .populate('companyMentorId', 'name');

    if (!record) return res.status(404).json({ success: false, message: 'No internship record found' });

    const finalSubmission = await FinalSubmission.findOne({ internshipRecordId: record._id });
    const reports = await WeeklyReport.find({ internshipRecordId: record._id });
    const milestones = await Milestone.find({ internshipRecordId: record._id });

    res.json({ success: true, data: { record, finalSubmission, reports, milestones } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/digital-record/:id/outcome — TPO sets outcome
const setOutcome = async (req, res) => {
  try {
    const { outcome } = req.body; // COMPLETED | PPO | EXTENDED | NO_OFFER
    const validOutcomes = ['COMPLETED', 'PPO', 'EXTENDED', 'NO_OFFER'];
    if (!validOutcomes.includes(outcome)) {
      return res.status(400).json({ success: false, message: `Outcome must be one of: ${validOutcomes.join(', ')}` });
    }

    const record = await InternshipRecord.findByIdAndUpdate(
      req.params.id,
      { outcome },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyDigitalRecord, getStudentDigitalRecord, setOutcome };
