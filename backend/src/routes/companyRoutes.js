const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getCompanies, createCompany, getCompany } = require('../controllers/companyController');

router.get('/', authenticate, getCompanies);
router.post('/', authenticate, authorize('RECRUITER', 'TPO_ADMIN'), createCompany);
router.get('/:id', authenticate, getCompany);

module.exports = router;
