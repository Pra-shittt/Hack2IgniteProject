const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// GET /api/users/students - TPO/COLLEGE_MENTOR
const getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'STUDENT', isActive: true }).select('-passwordHash');
    const profiles = await StudentProfile.find({ userId: { $in: students.map((s) => s._id) } });
    const profileMap = {};
    profiles.forEach((p) => { profileMap[p.userId.toString()] = p; });

    const result = students.map((s) => ({
      ...s.toJSON(),
      profile: profileMap[s._id.toString()] || null,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/profile - Student gets own profile
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    res.json({ success: true, user: req.user, profile });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/profile - Student updates own profile
const updateMyProfile = async (req, res, next) => {
  try {
    const { college, department, year, enrollmentNumber, skills, bio, cgpa, phone, name } = req.body;

    // Update user name/phone
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    if (Object.keys(userUpdate).length) {
      await User.findByIdAndUpdate(req.user._id, userUpdate);
    }

    // Update student profile
    const profileUpdate = {};
    if (college !== undefined) profileUpdate.college = college;
    if (department !== undefined) profileUpdate.department = department;
    if (year !== undefined) profileUpdate.year = year;
    if (enrollmentNumber !== undefined) profileUpdate.enrollmentNumber = enrollmentNumber;
    if (skills !== undefined) profileUpdate.skills = skills;
    if (bio !== undefined) profileUpdate.bio = bio;
    if (cgpa !== undefined) profileUpdate.cgpa = cgpa;

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: profileUpdate },
      { new: true, upsert: true }
    );

    const updatedUser = await User.findById(req.user._id).select('-passwordHash');
    res.json({ success: true, user: updatedUser, profile });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/profile/resume - Upload resume
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded', code: 'NO_FILE' });
    }
    const result = await uploadToCloudinary(req.file.buffer, 'resumes');
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { resumeUrl: result.secure_url },
      { new: true, upsert: true }
    );
    res.json({ success: true, resumeUrl: result.secure_url, profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudents, getMyProfile, updateMyProfile, uploadResume };
