const Application = require('../models/Application');
const Internship = require('../models/Internship');
const StudentProfile = require('../models/StudentProfile');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// POST /api/applications - Student
const applyToInternship = async (req, res, next) => {
  try {
    const { internshipId, coverLetter } = req.body;

    // Check internship exists and is open
    const internship = await Internship.findById(internshipId);
    if (!internship || internship.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'Internship not available', code: 'NOT_AVAILABLE' });
    }

    // Check deadline
    if (internship.applicationDeadline && new Date() > internship.applicationDeadline) {
      return res.status(400).json({ success: false, message: 'Application deadline passed', code: 'DEADLINE_PASSED' });
    }

    // Check already applied
    const existing = await Application.findOne({ studentId: req.user._id, internshipId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already applied', code: 'ALREADY_APPLIED' });
    }

    // Get resume from profile
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    let resumeUrl = profile?.resumeUrl || null;

    // If file uploaded with this request, upload it
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'resumes', 'raw', req.file.originalname);
      resumeUrl = result.secure_url;
    }

    const application = await Application.create({
      studentId: req.user._id,
      internshipId,
      resumeUrl,
      coverLetter,
      status: 'APPLIED',
    });

    const populated = await application.populate([
      { path: 'internshipId', populate: { path: 'companyId', select: 'name logoUrl' } },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/my - Student
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate({ path: 'internshipId', populate: { path: 'companyId', select: 'name logoUrl location' } })
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};

// GET /api/internships/:id/applications - Recruiter
const getInternshipApplications = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found', code: 'NOT_FOUND' });

    // Ownership check
    if (req.user.role === 'RECRUITER' && internship.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized', code: 'FORBIDDEN' });
    }

    const { status } = req.query;
    const query = { internshipId: req.params.id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({ path: 'studentId', select: 'name email phone', populate: { path: 'id' } })
      .populate('studentId', 'name email phone')
      .sort({ appliedAt: -1 });

    // Attach profiles
    const studentIds = applications.map((a) => a.studentId?._id);
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } });
    const profileMap = {};
    profiles.forEach((p) => { profileMap[p.userId.toString()] = p; });

    const result = applications.map((a) => ({
      ...a.toJSON(),
      studentProfile: profileMap[a.studentId?._id?.toString()] || null,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/applications/:id/status - Recruiter
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, recruiterRemarks } = req.body;
    const validStatuses = ['SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'OFFERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status', code: 'INVALID_STATUS' });
    }

    const application = await Application.findById(req.params.id).populate('internshipId');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found', code: 'NOT_FOUND' });

    // Recruiter ownership
    if (req.user.role === 'RECRUITER' && application.internshipId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized', code: 'FORBIDDEN' });
    }

    application.status = status;
    if (recruiterRemarks) application.recruiterRemarks = recruiterRemarks;
    await application.save();

    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/:id - Get single application
const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'studentId', select: 'name email phone' })
      .populate({ path: 'internshipId', populate: { path: 'companyId', select: 'name logoUrl' } });

    if (!application) return res.status(404).json({ success: false, message: 'Not found', code: 'NOT_FOUND' });

    // Auth check: student sees own, recruiter sees their internship's apps
    if (req.user.role === 'STUDENT' && application.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized', code: 'FORBIDDEN' });
    }

    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

module.exports = { applyToInternship, getMyApplications, getInternshipApplications, updateApplicationStatus, getApplication };
