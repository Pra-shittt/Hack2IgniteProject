const Internship = require('../models/Internship');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');

// GET /api/internships - with search, filter, pagination
const getInternships = async (req, res, next) => {
  try {
    const { search, status = 'OPEN', skills, location, minStipend, page = 1, limit = 12 } = req.query;

    const query = {};

    // Recruiter sees their own; others see OPEN
    if (req.user.role === 'RECRUITER') {
      query.createdBy = req.user._id;
    } else {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (skills) {
      const skillsArr = skills.split(',').map((s) => s.trim());
      query.skills = { $in: skillsArr };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (minStipend) {
      query.stipend = { $gte: Number(minStipend) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [internships, total] = await Promise.all([
      Internship.find(query)
        .populate('companyId', 'name logoUrl location industry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Internship.countDocuments(query),
    ]);

    res.json({ success: true, data: internships, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

// GET /api/internships/:id
const getInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id).populate('companyId', 'name logoUrl location industry website description');
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found', code: 'NOT_FOUND' });

    // Check if student has already applied
    let application = null;
    let eligibilityResult = null;

    if (req.user.role === 'STUDENT') {
      application = await Application.findOne({ studentId: req.user._id, internshipId: internship._id });

      // Eligibility check
      const profile = await StudentProfile.findOne({ userId: req.user._id });
      eligibilityResult = checkEligibility(internship.eligibility, profile);
    }

    res.json({ success: true, data: internship, application, eligibilityResult });
  } catch (err) {
    next(err);
  }
};

// POST /api/internships - Recruiter
const createInternship = async (req, res, next) => {
  try {
    const {
      title, description, skills, eligibility, location, stipend,
      duration, applicationDeadline, preparationTips, technicalQuestions, hrQuestions,
    } = req.body;

    if (!req.user.companyId) {
      return res.status(400).json({
        success: false,
        message: 'You must be associated with a company first. Create or join a company.',
        code: 'NO_COMPANY',
      });
    }

    const internship = await Internship.create({
      companyId: req.user.companyId,
      createdBy: req.user._id,
      title, description,
      skills: skills || [],
      eligibility: eligibility || {},
      location, stipend, duration, applicationDeadline,
      preparationTips: preparationTips || [],
      technicalQuestions: technicalQuestions || [],
      hrQuestions: hrQuestions || [],
      status: 'OPEN',
    });

    const populated = await internship.populate('companyId', 'name logoUrl');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/internships/:id - Owner Recruiter/TPO
const updateInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found', code: 'NOT_FOUND' });

    // Ownership check for recruiter
    if (req.user.role === 'RECRUITER' && internship.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized', code: 'FORBIDDEN' });
    }

    const allowed = ['title', 'description', 'skills', 'eligibility', 'location', 'stipend',
      'duration', 'applicationDeadline', 'status', 'preparationTips', 'technicalQuestions', 'hrQuestions'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) internship[field] = req.body[field];
    });

    await internship.save();
    res.json({ success: true, data: internship });
  } catch (err) {
    next(err);
  }
};

// Helper: check eligibility
function checkEligibility(eligibility, profile) {
  if (!eligibility || !profile) return { eligible: true, reasons: [] };

  const issues = [];

  if (eligibility.minCgpa && profile.cgpa < eligibility.minCgpa) {
    issues.push(`Minimum CGPA required: ${eligibility.minCgpa} (yours: ${profile.cgpa || 'not set'})`);
  }
  if (eligibility.allowedBranches?.length && !eligibility.allowedBranches.includes(profile.department)) {
    issues.push(`Branch not in eligible list: ${eligibility.allowedBranches.join(', ')}`);
  }
  if (eligibility.allowedYears?.length && !eligibility.allowedYears.includes(profile.year)) {
    issues.push(`Year not eligible. Required: ${eligibility.allowedYears.join(', ')}`);
  }

  return { eligible: issues.length === 0, reasons: issues };
}

module.exports = { getInternships, getInternship, createInternship, updateInternship };
