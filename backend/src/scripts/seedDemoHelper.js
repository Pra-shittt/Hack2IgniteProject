const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const Approval = require('../models/Approval');
const InternshipRecord = require('../models/InternshipRecord');
const Milestone = require('../models/Milestone');
const WeeklyReport = require('../models/WeeklyReport');
const FinalSubmission = require('../models/FinalSubmission');

module.exports = async function seedDemoHelper() {
  const defaultPassword = 'Password123!';

  // Clean old demo users
  const demoEmails = [
    'student@demo.com',
    'student2@demo.com',
    'recruiter@demo.com',
    'tpo@demo.com',
    'college.mentor@demo.com',
    'company.mentor@demo.com',
  ];
  await User.deleteMany({ email: { $in: demoEmails } });

  // 1. Company
  let company = await Company.findOne({ name: 'Infosys Cloud Labs' });
  if (!company) {
    company = await Company.create({
      name: 'Infosys Cloud Labs',
      website: 'https://infosys.com',
      description: 'Next-generation digital enterprise & cloud transformation platforms.',
      industry: 'Information Technology & Software Services',
      location: 'Bengaluru, India',
    });
  }

  // 2. Users (Indian Demo Ecosystem)
  const studentUser = await User.create({
    name: 'Aarav Sharma',
    email: 'student@demo.com',
    passwordHash: defaultPassword,
    role: 'STUDENT',
    phone: '+91 9876543210',
  });

  const studentUser2 = await User.create({
    name: 'Priya Patel',
    email: 'student2@demo.com',
    passwordHash: defaultPassword,
    role: 'STUDENT',
    phone: '+91 9876543215',
  });

  const recruiterUser = await User.create({
    name: 'Pooja Verma',
    email: 'recruiter@demo.com',
    passwordHash: defaultPassword,
    role: 'RECRUITER',
    phone: '+91 9876543211',
    companyId: company._id,
  });

  const tpoUser = await User.create({
    name: 'Dr. Rajesh Kulkarni',
    email: 'tpo@demo.com',
    passwordHash: defaultPassword,
    role: 'TPO_ADMIN',
    phone: '+91 9876543212',
  });

  const collegeMentorUser = await User.create({
    name: 'Prof. Sunita Patil',
    email: 'college.mentor@demo.com',
    passwordHash: defaultPassword,
    role: 'COLLEGE_MENTOR',
    phone: '+91 9876543213',
  });

  const companyMentorUser = await User.create({
    name: 'Vikram Malhotra',
    email: 'company.mentor@demo.com',
    passwordHash: defaultPassword,
    role: 'COMPANY_MENTOR',
    phone: '+91 9876543214',
    companyId: company._id,
  });

  // 3. Student Profiles
  await StudentProfile.findOneAndUpdate(
    { userId: studentUser._id },
    {
      userId: studentUser._id,
      college: 'Veermata Jijabai Technological Institute (VJTI), Mumbai',
      department: 'Computer Engineering',
      year: 3,
      enrollmentNumber: 'VJTI2023CS042',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Tailwind CSS', 'REST APIs'],
      bio: 'Passionate full-stack developer eager to build scalable web applications.',
      cgpa: 8.85,
    },
    { upsert: true, new: true }
  );

  await StudentProfile.findOneAndUpdate(
    { userId: studentUser2._id },
    {
      userId: studentUser2._id,
      college: 'Veermata Jijabai Technological Institute (VJTI), Mumbai',
      department: 'Information Technology',
      year: 4,
      enrollmentNumber: 'VJTI2022IT018',
      skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Docker', 'AWS'],
      bio: 'Final year software engineering intern specialized in microservices.',
      cgpa: 9.15,
    },
    { upsert: true, new: true }
  );

  // 4. Internship
  let internship = await Internship.findOne({ title: 'Full Stack Cloud Developer Intern', companyId: company._id });
  if (!internship) {
    internship = await Internship.create({
      companyId: company._id,
      createdBy: recruiterUser._id,
      title: 'Full Stack Cloud Developer Intern',
      description: 'Join our cloud team to build responsive modern dashboards and secure microservices.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB'],
      eligibility: {
        minCgpa: 7.5,
        allowedBranches: ['Computer Engineering', 'Information Technology'],
        allowedYears: [3, 4],
        description: 'Basic knowledge of web development, JavaScript ES6, and Git.',
      },
      location: 'Hybrid (Bengaluru / Remote)',
      stipend: 25000,
      duration: '3 months',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
    });
  }

  // 5. Applications & Offers
  const app1 = await Application.create({
    studentId: studentUser._id,
    internshipId: internship._id,
    status: 'SELECTED',
  });
  const app2 = await Application.create({
    studentId: studentUser2._id,
    internshipId: internship._id,
    status: 'SELECTED',
  });

  const offer1 = await Offer.create({
    applicationId: app1._id,
    studentId: studentUser._id,
    internshipId: internship._id,
    companyId: company._id,
    joiningDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    stipend: 25000,
    duration: '3 months',
    location: 'Hybrid (Bengaluru / Remote)',
    status: 'ACCEPTED',
  });

  const offer2 = await Offer.create({
    applicationId: app2._id,
    studentId: studentUser2._id,
    internshipId: internship._id,
    companyId: company._id,
    joiningDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    stipend: 30000,
    duration: '3 months',
    location: 'Bengaluru, India',
    status: 'ACCEPTED',
  });

  // 6. Approvals & NOC
  const approval1 = await Approval.create({
    offerId: offer1._id,
    studentId: studentUser._id,
    internshipId: internship._id,
    reviewedBy: tpoUser._id,
    status: 'APPROVED',
    nocIssued: true,
    remarks: 'NOC Issued by Training & Placement Cell for academic semester credits.',
  });

  const approval2 = await Approval.create({
    offerId: offer2._id,
    studentId: studentUser2._id,
    internshipId: internship._id,
    reviewedBy: tpoUser._id,
    status: 'APPROVED',
    nocIssued: true,
    remarks: 'NOC Issued for Capstone Project Internship.',
  });

  // 7. Internship Records
  const record1 = await InternshipRecord.create({
    studentId: studentUser._id,
    internshipId: internship._id,
    companyId: company._id,
    offerId: offer1._id,
    approvalId: approval1._id,
    collegeMentorId: collegeMentorUser._id,
    companyMentorId: companyMentorUser._id,
    startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 69 * 24 * 60 * 60 * 1000),
    warningStatus: 'ON_TRACK',
    status: 'ACTIVE',
    roleTitle: 'Full Stack Cloud Developer Intern',
    skillsGained: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
    progressPercent: 45,
  });

  const record2 = await InternshipRecord.create({
    studentId: studentUser2._id,
    internshipId: internship._id,
    companyId: company._id,
    offerId: offer2._id,
    approvalId: approval2._id,
    collegeMentorId: collegeMentorUser._id,
    companyMentorId: companyMentorUser._id,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    warningStatus: 'ON_TRACK',
    status: 'COMPLETED',
    roleTitle: 'Cloud Solutions Architecture Intern',
    skillsGained: ['React', 'TypeScript', 'Node.js', 'AWS Lambda', 'Docker'],
    progressPercent: 100,
  });

  // 8. Milestones
  await Milestone.create([
    {
      internshipRecordId: record1._id,
      companyMentorId: companyMentorUser._id,
      title: 'Sprint 1: System Architecture & Auth Setup',
      description: 'Setup JWT authentication and Mongo schema.',
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      progress: 100,
      status: 'COMPLETED',
    },
    {
      internshipRecordId: record1._id,
      companyMentorId: companyMentorUser._id,
      title: 'Sprint 2: Analytics Dashboard & REST APIs',
      description: 'Build backend aggregation queries.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      progress: 60,
      status: 'IN_PROGRESS',
    },
  ]);

  // 9. Weekly Reports
  await WeeklyReport.create([
    {
      internshipRecordId: record1._id,
      studentId: studentUser._id,
      weekNumber: 1,
      workSummary: 'Completed environment setup, configured MongoDB Atlas, and reviewed coding guidelines with Vikram Malhotra.',
      skillsUsed: ['Git', 'MongoDB', 'Docker'],
      learningOutcomes: 'Understood containerization workflow and enterprise standards.',
      attendanceDays: 5,
      progressPercent: 100,
      status: 'VERIFIED',
      mentorComment: 'Punctual submission. High code quality.',
      verifiedBy: companyMentorUser._id,
      confidentialityCheck: { riskLevel: 'SAFE', skipped: false },
    },
    {
      internshipRecordId: record1._id,
      studentId: studentUser._id,
      weekNumber: 2,
      workSummary: 'Implemented student record query endpoints and verified JWT role guards across routes.',
      skillsUsed: ['Express', 'JWT', 'Node.js'],
      learningOutcomes: 'Mastered role-based access control and token verification.',
      attendanceDays: 5,
      progressPercent: 80,
      status: 'SUBMITTED',
      confidentialityCheck: { riskLevel: 'SAFE', skipped: false },
    },
  ]);

  // 10. Completed Final Submission (Record 2 - Priya Patel)
  await FinalSubmission.create({
    internshipRecordId: record2._id,
    studentId: studentUser2._id,
    projectSummary: 'Architected and deployed a multi-tenant telemetry ingestion pipeline capable of processing 10,000 requests/sec with Redis caching.',
    skillsLearned: ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS Lambda'],
    finalReportUrl: 'https://example.com/reports/priya_patel_final_report.pdf',
    presentationUrl: 'https://example.com/slides/priya_patel_presentation.pdf',
    certificateUrl: 'https://example.com/certs/infosys_completion_certificate.pdf',
    status: 'COMPLETED',
    companyEvaluation: {
      participation: 5,
      professionalism: 5,
      technicalLearning: 5,
      communication: 5,
      overallRating: 5,
      feedback: 'Exceptional intern! Demonstrated senior-level problem solving and earned a full-time Pre-Placement Offer (PPO).',
      evaluatedBy: companyMentorUser._id,
    },
    collegeMentorReview: {
      recommendation: 'Outstanding performance validated. Recommended for 20 Academic Honors credits.',
      reviewedBy: collegeMentorUser._id,
    },
    tpoApproval: {
      status: 'APPROVED',
      remarks: 'Formally approved. Verified digital credential generated and archived.',
      approvedBy: tpoUser._id,
    },
  });

  return { studentUser, studentUser2, recruiterUser, tpoUser, collegeMentorUser, companyMentorUser };
};
