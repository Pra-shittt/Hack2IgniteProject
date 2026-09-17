const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { scheduleInterview, getMyInterviews, getInterview, joinInterview, updateInterviewStatus } = require('../controllers/interviewController');

router.post('/', authenticate, authorize('RECRUITER'), scheduleInterview);
router.get('/my', authenticate, authorize('STUDENT', 'RECRUITER'), getMyInterviews);
router.get('/:id', authenticate, getInterview);
router.post('/:id/join', authenticate, authorize('STUDENT', 'RECRUITER'), joinInterview);
router.patch('/:id/status', authenticate, authorize('RECRUITER'), updateInterviewStatus);

module.exports = router;
