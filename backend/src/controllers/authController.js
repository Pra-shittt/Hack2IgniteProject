const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, companyId } = req.body;

    // Only allow these public registration roles
    const publicRoles = ['STUDENT', 'RECRUITER', 'COMPANY_MENTOR'];
    if (!publicRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot self-register with this role. Contact admin.',
        code: 'INVALID_ROLE',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered', code: 'DUPLICATE_EMAIL' });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // pre-save hook hashes it
      role,
      phone,
      companyId: companyId || undefined,
    });

    // Create student profile automatically
    if (role === 'STUDENT') {
      await StudentProfile.create({ userId: user._id });
    }

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    // Auto-seed demo accounts on-demand if a demo user is requested but not yet in DB
    if (!user && email && email.endsWith('@demo.com')) {
      try {
        const seedScript = require('../scripts/seedDemoHelper');
        await seedScript();
        user = await User.findOne({ email });
      } catch (seedErr) {
        console.warn('Auto-seed demo attempt:', seedErr.message);
      }
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'STUDENT') {
      profile = await StudentProfile.findOne({ userId: user._id });
    }

    res.json({ success: true, user, profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
