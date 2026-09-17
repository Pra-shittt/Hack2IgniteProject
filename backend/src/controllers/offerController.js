const Offer = require('../models/Offer');
const Application = require('../models/Application');
const Approval = require('../models/Approval');
const InternshipRecord = require('../models/InternshipRecord');

// POST /api/offers — Recruiter creates offer for SELECTED candidate
const createOffer = async (req, res) => {
  try {
    const { applicationId, joiningDate, stipend, duration, location, additionalNote } = req.body;

    const application = await Application.findById(applicationId).populate('internshipId');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.status !== 'SELECTED') {
      return res.status(400).json({ success: false, message: 'Application must be in SELECTED status to create offer' });
    }

    // Prevent duplicate offer
    const existing = await Offer.findOne({ applicationId });
    if (existing) return res.status(409).json({ success: false, message: 'Offer already exists for this application' });

    const offer = await Offer.create({
      applicationId,
      studentId: application.studentId,
      internshipId: application.internshipId._id,
      companyId: application.internshipId.companyId,
      joiningDate,
      stipend: stipend || application.internshipId.stipend,
      duration: duration || application.internshipId.duration,
      location: location || application.internshipId.location,
      additionalNote,
    });

    // Update application status to OFFERED
    await Application.findByIdAndUpdate(applicationId, { status: 'OFFERED' });

    // Auto-create pending TPO approval
    await Approval.create({
      offerId: offer._id,
      studentId: offer.studentId,
      internshipId: offer.internshipId,
    });

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/offers/my — Student sees their offer
const getMyOffer = async (req, res) => {
  try {
    const offer = await Offer.findOne({ studentId: req.user._id })
      .populate('internshipId', 'title duration location stipend')
      .populate('companyId', 'name logo');
    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/offers/:id/respond — Student accepts/declines
const respondToOffer = async (req, res) => {
  try {
    const { status } = req.body; // 'ACCEPTED' | 'DECLINED'
    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid response. Use ACCEPTED or DECLINED.' });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    if (offer.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your offer' });
    }
    if (offer.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Offer already responded to' });
    }

    offer.status = status;
    offer.studentResponse = new Date();
    await offer.save();

    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/offers — Recruiter lists offers for their internships
const listOffers = async (req, res) => {
  try {
    const { internshipId } = req.query;
    const filter = {};
    if (internshipId) filter.internshipId = internshipId;

    const offers = await Offer.find(filter)
      .populate('studentId', 'name email')
      .populate('internshipId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: offers, total: offers.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOffer, getMyOffer, respondToOffer, listOffers };
