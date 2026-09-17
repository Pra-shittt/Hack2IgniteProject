const Company = require('../models/Company');
const User = require('../models/User');

// GET /api/companies
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json({ success: true, data: companies });
  } catch (err) {
    next(err);
  }
};

// POST /api/companies - Recruiter/TPO
const createCompany = async (req, res, next) => {
  try {
    const { name, website, description, industry, location, logoUrl } = req.body;
    const company = await Company.create({
      name, website, description, industry, location, logoUrl,
      createdBy: req.user._id,
    });

    // If recruiter, associate them with this company
    if (req.user.role === 'RECRUITER') {
      await User.findByIdAndUpdate(req.user._id, { companyId: company._id });
    }

    res.status(201).json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
};

// GET /api/companies/:id
const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found', code: 'NOT_FOUND' });
    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCompanies, createCompany, getCompany };
