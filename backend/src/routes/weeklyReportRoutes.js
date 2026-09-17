const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { submitReport, saveDraft, listReports, getReport, verifyReport } = require('../controllers/weeklyReportController');

// Student submits (triggers AI check)
router.post('/', authenticate, authorize('STUDENT'), submitReport);

// Student saves draft (no AI check)
router.post('/draft', authenticate, authorize('STUDENT'), saveDraft);

// List reports
router.get('/', authenticate, listReports);

// Get single report
router.get('/:id', authenticate, getReport);

// Company mentor verifies or requests revision
router.patch('/:id/verify', authenticate, authorize('COMPANY_MENTOR', 'TPO_ADMIN'), verifyReport);

module.exports = router;
