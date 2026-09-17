const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Interview = require('../models/Interview');
const User = require('../models/User');

// GET /api/student/dashboard
const studentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const [applications, interviews] = await Promise.all([
      Application.find({ studentId })
        .populate({ path: 'internshipId', populate: { path: 'companyId', select: 'name logoUrl' } })
        .sort({ appliedAt: -1 })
        .limit(5),
      Interview.find({ studentId, status: { $in: ['SCHEDULED', 'IN_PROGRESS'] } })
        .populate({ path: 'internshipId', select: 'title', populate: { path: 'companyId', select: 'name' } })
        .sort({ scheduledAt: 1 })
        .limit(3),
    ]);

    const stats = {
      totalApplications: await Application.countDocuments({ studentId }),
      shortlisted: await Application.countDocuments({ studentId, status: 'SHORTLISTED' }),
      interviews: await Application.countDocuments({ studentId, status: 'INTERVIEW' }),
      selected: await Application.countDocuments({ studentId, status: { $in: ['SELECTED', 'OFFERED'] } }),
    };

    res.json({ success: true, data: { stats, recentApplications: applications, upcomingInterviews: interviews } });
  } catch (err) {
    next(err);
  }
};

// GET /api/recruiter/dashboard
const recruiterDashboard = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    const internships = await Internship.find({ createdBy: recruiterId });
    const internshipIds = internships.map((i) => i._id);

    const [totalApps, shortlisted, interviews, selected, upcomingInterviews] = await Promise.all([
      Application.countDocuments({ internshipId: { $in: internshipIds } }),
      Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'SHORTLISTED' }),
      Application.countDocuments({ internshipId: { $in: internshipIds }, status: 'INTERVIEW' }),
      Application.countDocuments({ internshipId: { $in: internshipIds }, status: { $in: ['SELECTED', 'OFFERED'] } }),
      Interview.find({ recruiterId, status: 'SCHEDULED' })
        .populate('studentId', 'name email')
        .populate({ path: 'internshipId', select: 'title' })
        .sort({ scheduledAt: 1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          openInternships: internships.filter((i) => i.status === 'OPEN').length,
          totalApplications: totalApps,
          shortlisted,
          interviews,
          selected,
        },
        upcomingInterviews,
        recentInternships: internships.slice(0, 5),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tpo/dashboard
const tpoDashboard = async (req, res, next) => {
  try {
    const [totalStudents, totalInternships, openInternships, totalApps] = await Promise.all([
      User.countDocuments({ role: 'STUDENT', isActive: true }),
      Internship.countDocuments(),
      Internship.countDocuments({ status: 'OPEN' }),
      Application.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalStudents, totalInternships, openInternships, totalApplications: totalApps },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/mentor/dashboard - College Mentor
const mentorDashboard = async (req, res, next) => {
  try {
    res.json({ success: true, data: { stats: { assignedStudents: 0, activeInternships: 0 } } });
  } catch (err) {
    next(err);
  }
};

// GET /api/company-mentor/dashboard
const companyMentorDashboard = async (req, res, next) => {
  try {
    res.json({ success: true, data: { stats: { assignedInterns: 0, pendingReports: 0 } } });
  } catch (err) {
    next(err);
  }
};

module.exports = { studentDashboard, recruiterDashboard, tpoDashboard, mentorDashboard, companyMentorDashboard };
