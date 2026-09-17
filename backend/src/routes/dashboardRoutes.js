const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { studentDashboard, recruiterDashboard, tpoDashboard, mentorDashboard, companyMentorDashboard } = require('../controllers/dashboardController');

router.get('/student/dashboard', authenticate, authorize('STUDENT'), studentDashboard);
router.get('/recruiter/dashboard', authenticate, authorize('RECRUITER'), recruiterDashboard);
router.get('/tpo/dashboard', authenticate, authorize('TPO_ADMIN'), tpoDashboard);
router.get('/mentor/dashboard', authenticate, authorize('COLLEGE_MENTOR'), mentorDashboard);
router.get('/company-mentor/dashboard', authenticate, authorize('COMPANY_MENTOR'), companyMentorDashboard);

module.exports = router;
