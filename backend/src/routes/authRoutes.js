const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);

// GET /api/auth/seed-demo - Seed / reset demo Indian ecosystem for hackathon judges
router.get('/seed-demo', async (req, res, next) => {
  try {
    const seedDemoHelper = require('../scripts/seedDemoHelper');
    const result = await seedDemoHelper();
    res.json({
      success: true,
      message: 'Demo ecosystem with Indian personas seeded successfully!',
      users: [
        { role: 'STUDENT', email: 'student@demo.com', name: 'Aarav Sharma' },
        { role: 'STUDENT', email: 'student2@demo.com', name: 'Priya Patel' },
        { role: 'RECRUITER', email: 'recruiter@demo.com', name: 'Pooja Verma' },
        { role: 'TPO_ADMIN', email: 'tpo@demo.com', name: 'Dr. Rajesh Kulkarni' },
        { role: 'COLLEGE_MENTOR', email: 'college.mentor@demo.com', name: 'Prof. Sunita Patil' },
        { role: 'COMPANY_MENTOR', email: 'company.mentor@demo.com', name: 'Vikram Malhotra' },
      ],
      password: 'Password123!'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
