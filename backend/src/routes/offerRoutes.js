const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createOffer, getMyOffer, respondToOffer, listOffers } = require('../controllers/offerController');

// Recruiter creates offer
router.post('/', authenticate, authorize('RECRUITER'), createOffer);

// Student views their offer
router.get('/my', authenticate, authorize('STUDENT'), getMyOffer);

// Student accepts/declines
router.patch('/:id/respond', authenticate, authorize('STUDENT'), respondToOffer);

// Recruiter lists offers
router.get('/', authenticate, authorize('RECRUITER', 'TPO_ADMIN'), listOffers);

module.exports = router;
