/**
 * Input Validation Middleware
 * Lightweight validation using plain JS — no extra libraries required.
 * Returns consistent 400 errors for invalid inputs.
 */

const validateBody = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];

      // required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      if (value === undefined || value === null || value === '') continue;

      // type checks
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }
      if (rule.type === 'number' && (typeof value !== 'number' || isNaN(value))) {
        errors.push(`${field} must be a number`);
      }
      if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email address`);
      }

      // string constraints
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }

      // enum
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
      }

      // number constraints
      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push(`${field} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        errors.push(`${field} must be at most ${rule.max}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    next();
  };
};

// ─── Pre-built validators for common routes ────────────────────────────────────

const validateRegister = validateBody({
  name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 6 },
  role: { required: true, enum: ['STUDENT', 'TPO_ADMIN', 'COLLEGE_MENTOR', 'RECRUITER', 'COMPANY_MENTOR'] },
});

const validateLogin = validateBody({
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 1 },
});

const validateWeeklyReport = validateBody({
  internshipRecordId: { required: true, type: 'string' },
  weekNumber: { required: true, type: 'number', min: 1, max: 52 },
  workSummary: { required: true, type: 'string', minLength: 20, maxLength: 5000 },
});

const validateOffer = validateBody({
  applicationId: { required: true, type: 'string' },
  stipend: { required: true, type: 'number', min: 0 },
  duration: { required: true, type: 'string' },
});

module.exports = { validateBody, validateRegister, validateLogin, validateWeeklyReport, validateOffer };
