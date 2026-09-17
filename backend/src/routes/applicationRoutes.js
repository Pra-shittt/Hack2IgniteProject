const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { applyToInternship, getMyApplications, updateApplicationStatus, getApplication } = require('../controllers/applicationController');

router.post('/', authenticate, authorize('STUDENT'), upload.single('resume'), applyToInternship);
router.get('/my', authenticate, authorize('STUDENT'), getMyApplications);
router.get('/:id', authenticate, getApplication);
router.patch('/:id/status', authenticate, authorize('RECRUITER', 'TPO_ADMIN'), updateApplicationStatus);

module.exports = router;
