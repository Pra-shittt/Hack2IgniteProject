const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getMyDigitalRecord, getStudentDigitalRecord, setOutcome } = require('../controllers/digitalRecordController');

// Student views their own digital record
router.get('/my', authenticate, authorize('STUDENT'), getMyDigitalRecord);

// TPO/mentor views any student's record
router.get('/student/:studentId', authenticate, authorize('TPO_ADMIN', 'COLLEGE_MENTOR'), getStudentDigitalRecord);

// TPO sets internship outcome
router.patch('/:id/outcome', authenticate, authorize('TPO_ADMIN'), setOutcome);

module.exports = router;
