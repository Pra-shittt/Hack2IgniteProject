const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { updateMilestone } = require('../controllers/internshipRecordController');

// Company mentor updates milestone progress/status
router.patch('/:id', authenticate, authorize('COMPANY_MENTOR', 'TPO_ADMIN'), updateMilestone);

module.exports = router;
