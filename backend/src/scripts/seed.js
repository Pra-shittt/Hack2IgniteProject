const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
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

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship-system';
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    console.log('Cleaning up existing demo users...');
    const demoEmails = [
      'student@demo.com',
      'student2@demo.com',
      'recruiter@demo.com',
      'tpo@demo.com',
      'college.mentor@demo.com',
      'company.mentor@demo.com',
    ];
    await User.deleteMany({ email: { $in: demoEmails } });

    console.log('Creating demo users with authentic Indian names...');
    const defaultPassword = 'Password123!';

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

    // 2. Create Users with Indian Names
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

    // 4. Internships
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
        preparationTips: ['Review asynchronous JavaScript and Promises', 'Understand RESTful API design principles'],
        technicalQuestions: ['Explain React component lifecycle vs Hooks', 'How does JWT authentication work?'],
        hrQuestions: ['Tell us about a challenging project you built', 'Why do you want to intern at Infosys Cloud Labs?'],
      });
    }

    // 5. Applications
    let application1 = await Application.create({
      studentId: studentUser._id,
      internshipId: internship._id,
      status: 'SELECTED',
      notes: 'Shortlisted and offered internship role.',
    });

    let application2 = await Application.create({
      studentId: studentUser2._id,
      internshipId: internship._id,
      status: 'SELECTED',
      notes: 'Completed interview loop successfully.',
    });

    // 6. Offers
    let offer1 = await Offer.create({
      applicationId: application1._id,
      studentId: studentUser._id,
      internshipId: internship._id,
      companyId: company._id,
      joiningDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      stipend: 25000,
      duration: '3 months',
      location: 'Hybrid (Bengaluru / Remote)',
      status: 'ACCEPTED',
      studentResponse: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    });

    let offer2 = await Offer.create({
      applicationId: application2._id,
      studentId: studentUser2._id,
      internshipId: internship._id,
      companyId: company._id,
      joiningDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      stipend: 30000,
      duration: '3 months',
      location: 'Bengaluru, India',
      status: 'ACCEPTED',
      studentResponse: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000),
    });

    // 7. Approvals (TPO NOC)
    let approval1 = await Approval.create({
      offerId: offer1._id,
      studentId: studentUser._id,
      internshipId: internship._id,
      reviewedBy: tpoUser._id,
      status: 'APPROVED',
      nocIssued: true,
      remarks: 'NOC Issued by Training & Placement Cell for academic semester credits.',
      reviewedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    });

    let approval2 = await Approval.create({
      offerId: offer2._id,
      studentId: studentUser2._id,
      internshipId: internship._id,
      reviewedBy: tpoUser._id,
      status: 'APPROVED',
      nocIssued: true,
      remarks: 'Full NOC issued for capstone project internship.',
      reviewedAt: new Date(Date.now() - 88 * 24 * 60 * 60 * 1000),
    });

    // 8. Internship Records
    // Record 1: Aarav Sharma (Active, On-Track)
    let record1 = await InternshipRecord.create({
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

    // Record 2: Priya Patel (Completed, Finished with high marks)
    let record2 = await InternshipRecord.create({
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

    // 9. Milestones for Record 1
    await Milestone.create([
      {
        internshipRecordId: record1._id,
        companyMentorId: companyMentorUser._id,
        title: 'Sprint 1: System Architecture & JWT Auth',
        description: 'Configure database connection, setup JWT bearer middleware, and design schema.',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        progress: 100,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        internshipRecordId: record1._id,
        companyMentorId: companyMentorUser._id,
        title: 'Sprint 2: Analytics Dashboard & REST APIs',
        description: 'Build backend aggregation pipeline and connect interactive charts.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        progress: 60,
        status: 'IN_PROGRESS',
      },
      {
        internshipRecordId: record1._id,
        companyMentorId: companyMentorUser._id,
        title: 'Sprint 3: CI/CD Pipeline & Automated Tests',
        description: 'Setup GitHub Actions pipeline and achieve 85% test coverage.',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'PENDING',
      },
    ]);

    // 10. Weekly Reports for Record 1
    await WeeklyReport.create([
      {
        internshipRecordId: record1._id,
        studentId: studentUser._id,
        weekNumber: 1,
        workSummary: 'Completed environment setup, configured MongoDB Atlas, and reviewed coding guidelines with Vikram Malhotra.',
        skillsUsed: ['Git', 'MongoDB', 'Docker'],
        learningOutcomes: 'Understood containerization workflow and enterprise coding standards.',
        challenges: 'Minor port conflict resolved by modifying compose config.',
        achievements: 'Passed initial onboarding checklist on schedule.',
        nextWeekGoals: 'Begin implementing authentication routes.',
        attendanceDays: 5,
        progressPercent: 100,
        status: 'VERIFIED',
        submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        mentorComment: 'Punctual submission. High code hygiene.',
        verifiedBy: companyMentorUser._id,
        verifiedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        confidentialityCheck: {
          riskLevel: 'SAFE',
          flaggedCategories: [],
          flaggedItems: [],
          suggestion: 'Report is clean and safe to submit.',
          checkedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      },
      {
        internshipRecordId: record1._id,
        studentId: studentUser._id,
        weekNumber: 2,
        workSummary: 'Implemented student record query endpoints and verified JWT role guards across routes.',
        skillsUsed: ['Express', 'JWT', 'Node.js'],
        learningOutcomes: 'Deepened mastery of role-based access control and token verification.',
        challenges: 'Handling token expiry edge cases in frontend interceptors.',
        achievements: 'Delivered authentication endpoints with unit tests.',
        nextWeekGoals: 'Integrate charts and analytics dashboard.',
        attendanceDays: 5,
        progressPercent: 80,
        status: 'SUBMITTED',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        confidentialityCheck: {
          riskLevel: 'SAFE',
          flaggedCategories: [],
          flaggedItems: [],
          suggestion: 'No sensitive data detected.',
          checkedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
    ]);

    // 11. Final Submission for Record 2 (Priya Patel) — Completely evaluated and approved
    await FinalSubmission.create({
      internshipRecordId: record2._id,
      studentId: studentUser2._id,
      projectSummary: 'Architected and deployed a multi-tenant telemetry ingestion pipeline capable of processing 10,000 requests/sec with Redis caching.',
      skillsLearned: ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS Lambda'],
      finalReportUrl: 'https://example.com/reports/priya_patel_final_report.pdf',
      presentationUrl: 'https://example.com/slides/priya_patel_presentation.pdf',
      certificateUrl: 'https://example.com/certs/infosys_completion_certificate.pdf',
      status: 'COMPLETED',
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      companyEvaluation: {
        participation: 5,
        professionalism: 5,
        technicalLearning: 5,
        communication: 5,
        overallRating: 5,
        feedback: 'Exceptional intern! Demonstrated senior-level problem solving and earned a full-time Pre-Placement Offer (PPO).',
        evaluatedBy: companyMentorUser._id,
        evaluatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      collegeMentorReview: {
        recommendation: 'Outstanding performance validated. Recommended for 20 Academic Honors credits.',
        reviewedBy: collegeMentorUser._id,
        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      tpoApproval: {
        status: 'APPROVED',
        remarks: 'Formally approved. Verified digital credential generated and archived.',
        approvedBy: tpoUser._id,
        approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    console.log('\n========================================');
    console.log('🎉 DEMO ECOSYSTEM SEEDED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('Indian Demo Accounts Ready for Hackathon Judges:\n');
    console.log('1. Student (Active & In Progress):');
    console.log('   Name:     Aarav Sharma');
    console.log('   Email:    student@demo.com');
    console.log('   Password: Password123!\n');
    console.log('2. Student (Completed with Verified Digital Record):');
    console.log('   Name:     Priya Patel');
    console.log('   Email:    student2@demo.com');
    console.log('   Password: Password123!\n');
    console.log('3. Recruiter (Company HR):');
    console.log('   Name:     Pooja Verma (Infosys Cloud Labs)');
    console.log('   Email:    recruiter@demo.com');
    console.log('   Password: Password123!\n');
    console.log('4. College TPO Admin:');
    console.log('   Name:     Dr. Rajesh Kulkarni (Head TPO, VJTI)');
    console.log('   Email:    tpo@demo.com');
    console.log('   Password: Password123!\n');
    console.log('5. College Faculty Mentor:');
    console.log('   Name:     Prof. Sunita Patil');
    console.log('   Email:    college.mentor@demo.com');
    console.log('   Password: Password123!\n');
    console.log('6. Company Industry Mentor:');
    console.log('   Name:     Vikram Malhotra');
    console.log('   Email:    company.mentor@demo.com');
    console.log('   Password: Password123!\n');
    console.log('========================================');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
