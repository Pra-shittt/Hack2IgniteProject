const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const { v4: uuidv4 } = require('uuid');

// POST /api/interviews - Recruiter schedules
const scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, round, roundName, scheduledAt, duration } = req.body;

    const application = await Application.findById(applicationId).populate('internshipId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found', code: 'NOT_FOUND' });
    }

    // Recruiter must own the internship
    if (application.internshipId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized', code: 'FORBIDDEN' });
    }

    // Update application status to INTERVIEW
    application.status = 'INTERVIEW';
    await application.save();

    const roomId = `room-${uuidv4()}`;

    const interview = await Interview.create({
      applicationId,
      internshipId: application.internshipId._id,
      studentId: application.studentId,
      recruiterId: req.user._id,
      scheduledBy: req.user._id,
      round: round || 1,
      roundName: roundName || `Round ${round || 1}`,
      scheduledAt: new Date(scheduledAt),
      roomId,
      duration: duration || 60,
      status: 'SCHEDULED',
    });

    const populated = await interview.populate([
      { path: 'studentId', select: 'name email' },
      { path: 'internshipId', select: 'title', populate: { path: 'companyId', select: 'name' } },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// GET /api/interviews/my - Student or Recruiter
const getMyInterviews = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'STUDENT') query.studentId = req.user._id;
    else if (req.user.role === 'RECRUITER') query.recruiterId = req.user._id;

    const interviews = await Interview.find(query)
      .populate({ path: 'studentId', select: 'name email' })
      .populate({ path: 'internshipId', select: 'title', populate: { path: 'companyId', select: 'name logoUrl' } })
      .sort({ scheduledAt: 1 });

    res.json({ success: true, data: interviews });
  } catch (err) {
    next(err);
  }
};

// GET /api/interviews/:id
const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate({ path: 'studentId', select: 'name email phone' })
      .populate({ path: 'recruiterId', select: 'name email' })
      .populate({ path: 'internshipId', select: 'title description', populate: { path: 'companyId', select: 'name logoUrl' } });

    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found', code: 'NOT_FOUND' });

    // Authorization: student, recruiter, or TPO
    const userId = req.user._id.toString();
    const isStudent = interview.studentId?._id?.toString() === userId;
    const isRecruiter = interview.recruiterId?._id?.toString() === userId;
    const isTpo = req.user.role === 'TPO_ADMIN';

    if (!isStudent && !isRecruiter && !isTpo) {
      return res.status(403).json({ success: false, message: 'Not authorized', code: 'FORBIDDEN' });
    }

    res.json({ success: true, data: interview });
  } catch (err) {
    next(err);
  }
};

// POST /api/interviews/:id/join - Returns ZEGO token info
const joinInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found', code: 'NOT_FOUND' });

    const userId = req.user._id.toString();
    const isStudent = interview.studentId.toString() === userId;
    const isRecruiter = interview.recruiterId.toString() === userId;

    if (!isStudent && !isRecruiter) {
      return res.status(403).json({ success: false, message: 'Not authorized to join', code: 'FORBIDDEN' });
    }

    // Update status to IN_PROGRESS if SCHEDULED
    if (interview.status === 'SCHEDULED') {
      interview.status = 'IN_PROGRESS';
      await interview.save();
    }

    // ZEGO token generation
    // If ZEGO credentials are not configured, return room info for client-side init
    const zegoAppId = process.env.ZEGO_APP_ID;
    const zegoServerSecret = process.env.ZEGO_SERVER_SECRET;

    let zegoToken = null;
    if (zegoAppId && zegoServerSecret) {
      // Generate ZEGO token server-side
      try {
        zegoToken = generateZegoToken(zegoAppId, zegoServerSecret, interview.roomId, userId, req.user.name);
      } catch (e) {
        console.warn('ZEGO token generation failed:', e.message);
      }
    }

    res.json({
      success: true,
      data: {
        roomId: interview.roomId,
        userId,
        userName: req.user.name,
        zegoAppId: zegoAppId ? Number(zegoAppId) : null,
        zegoServerSecret: zegoServerSecret || null,
        zegoToken,
        interviewId: interview._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/interviews/:id/status - Recruiter
const updateInterviewStatus = async (req, res, next) => {
  try {
    const { status, notes, evaluation } = req.body;
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: 'Not found', code: 'NOT_FOUND' });

    if (interview.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized', code: 'FORBIDDEN' });
    }

    if (status) interview.status = status;
    if (notes !== undefined) interview.notes = notes;
    if (evaluation !== undefined) interview.evaluation = evaluation;
    await interview.save();

    res.json({ success: true, data: interview });
  } catch (err) {
    next(err);
  }
};

// Simple ZEGO token generation (matches ZEGO's algorithm)
function generateZegoToken(appId, serverSecret, roomId, userId, userName) {
  // ZEGO token generation requires their SDK — return null for now, client handles it
  return null;
}

module.exports = { scheduleInterview, getMyInterviews, getInterview, joinInterview, updateInterviewStatus };
