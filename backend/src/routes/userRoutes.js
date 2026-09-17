const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getStudents, getMyProfile, updateMyProfile, uploadResume } = require('../controllers/userController');

router.get('/students', authenticate, authorize('TPO_ADMIN', 'COLLEGE_MENTOR'), getStudents);
router.get('/profile', authenticate, authorize('STUDENT'), getMyProfile);
router.patch('/profile', authenticate, authorize('STUDENT'), updateMyProfile);
router.post('/profile/resume', authenticate, authorize('STUDENT'), upload.single('resume'), uploadResume);

module.exports = router;
