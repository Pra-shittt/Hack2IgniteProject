const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listApprovals, reviewApproval, getMyApproval } = require('../controllers/approvalController');

// Student sees their approval status
router.get('/my', authenticate, authorize('STUDENT'), getMyApproval);

// TPO lists all approvals (optional ?status=PENDING)
router.get('/', authenticate, authorize('TPO_ADMIN'), listApprovals);

// TPO approves or rejects
router.patch('/:id', authenticate, authorize('TPO_ADMIN'), reviewApproval);

module.exports = router;
