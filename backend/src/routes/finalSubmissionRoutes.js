const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createSubmission, getMySubmission, getSubmission,
  listSubmissions, evaluateSubmission, collegeReview, tpoApprove,
} = require('../controllers/finalSubmissionController');

router.post('/', authenticate, authorize('STUDENT'), createSubmission);
router.get('/my', authenticate, authorize('STUDENT'), getMySubmission);
router.get('/', authenticate, authorize('TPO_ADMIN', 'COLLEGE_MENTOR', 'COMPANY_MENTOR'), listSubmissions);
router.get('/:id', authenticate, getSubmission);
router.patch('/:id/evaluate', authenticate, authorize('COMPANY_MENTOR'), evaluateSubmission);
router.patch('/:id/college-review', authenticate, authorize('COLLEGE_MENTOR'), collegeReview);
router.patch('/:id/tpo-approve', authenticate, authorize('TPO_ADMIN'), tpoApprove);

module.exports = router;
