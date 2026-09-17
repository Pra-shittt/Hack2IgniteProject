const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getMyRecord, listRecords, getRecord, assignMentor,
  createMilestone, getMilestones, updateMilestone,
} = require('../controllers/internshipRecordController');

// Student: get own active record
router.get('/my', authenticate, authorize('STUDENT'), getMyRecord);

// TPO: list all records
router.get('/', authenticate, authorize('TPO_ADMIN', 'COLLEGE_MENTOR'), listRecords);

// Any authorized: get single record
router.get('/:id', authenticate, getRecord);

// TPO: assign mentors
router.patch('/:id/assign-mentor', authenticate, authorize('TPO_ADMIN'), assignMentor);

// Milestones
router.post('/:id/milestones', authenticate, authorize('COMPANY_MENTOR', 'TPO_ADMIN'), createMilestone);
router.get('/:id/milestones', authenticate, getMilestones);

module.exports = router;
