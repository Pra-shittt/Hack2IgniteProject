const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getInternships, getInternship, createInternship, updateInternship } = require('../controllers/internshipController');
const { getInternshipApplications } = require('../controllers/applicationController');

router.get('/', authenticate, getInternships);
router.post('/', authenticate, authorize('RECRUITER'), createInternship);
router.get('/:id', authenticate, getInternship);
router.patch('/:id', authenticate, authorize('RECRUITER', 'TPO_ADMIN'), updateInternship);

// Nested: applications for this internship
router.get('/:id/applications', authenticate, authorize('RECRUITER', 'TPO_ADMIN'), getInternshipApplications);

module.exports = router;
