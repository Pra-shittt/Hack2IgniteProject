const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getMonitoringDashboard, getStudentMonitoring } = require('../controllers/monitoringController');

// TPO monitoring dashboard — all active internships with warning status
router.get('/', authenticate, authorize('TPO_ADMIN', 'COLLEGE_MENTOR'), getMonitoringDashboard);

// Detailed view for one student
router.get('/student/:studentId', authenticate, authorize('TPO_ADMIN', 'COLLEGE_MENTOR', 'COMPANY_MENTOR'), getStudentMonitoring);

module.exports = router;
