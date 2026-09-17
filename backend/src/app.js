const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

// Routes — Batch 1
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Routes — Batch 2
const offerRoutes = require('./routes/offerRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const internshipRecordRoutes = require('./routes/internshipRecordRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const weeklyReportRoutes = require('./routes/weeklyReportRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const finalSubmissionRoutes = require('./routes/finalSubmissionRoutes');
const digitalRecordRoutes = require('./routes/digitalRecordRoutes');

const path = require('path');

const app = express();

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server is running' }));

// API Routes — Batch 1
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api', dashboardRoutes);

// API Routes — Batch 2
app.use('/api/offers', offerRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/internship-records', internshipRecordRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/weekly-reports', weeklyReportRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/final-submissions', finalSubmissionRoutes);
app.use('/api/digital-record', digitalRecordRoutes);

// 404
app.use('/{*path}', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
