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

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship-system';
    console.log(`Connecting to MongoDB at: ${mongoUri.split('@')[1] || mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    console.log('Cleaning up existing demo users...');
    const demoEmails = [
      'student@demo.com',
      'recruiter@demo.com',
      'tpo@demo.com',
      'college.mentor@demo.com',
      'company.mentor@demo.com',
    ];
    await User.deleteMany({ email: { $in: demoEmails } });

    console.log('Creating demo users...');
    const defaultPassword = 'Password123!';

    // 1. Company
    let company = await Company.findOne({ name: 'TechFlow Systems' });
    if (!company) {
      company = await Company.create({
        name: 'TechFlow Systems',
        website: 'https://techflow.example.com',
        description: 'Modern enterprise cloud & AI software solutions.',
        industry: 'Software & Cloud Services',
        location: 'Bengaluru, India',
      });
    }

    // 2. Create Users
    const studentUser = await User.create({
      name: 'Priya Sharma',
      email: 'student@demo.com',
      passwordHash: defaultPassword,
      role: 'STUDENT',
      phone: '+91 9876543210',
    });

    const recruiterUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@demo.com',
      passwordHash: defaultPassword,
      role: 'RECRUITER',
      phone: '+91 9876543211',
      companyId: company._id,
    });

    const tpoUser = await User.create({
      name: 'Dr. Ramesh Kumar',
      email: 'tpo@demo.com',
      passwordHash: defaultPassword,
      role: 'TPO_ADMIN',
      phone: '+91 9876543212',
    });

    const collegeMentorUser = await User.create({
      name: 'Prof. Ananya Sen',
      email: 'college.mentor@demo.com',
      passwordHash: defaultPassword,
      role: 'COLLEGE_MENTOR',
      phone: '+91 9876543213',
    });

    const companyMentorUser = await User.create({
      name: 'Alex Chen',
      email: 'company.mentor@demo.com',
      passwordHash: defaultPassword,
      role: 'COMPANY_MENTOR',
      phone: '+91 9876543214',
      companyId: company._id,
    });

    // 3. Student Profile
    await StudentProfile.findOneAndUpdate(
      { userId: studentUser._id },
      {
        userId: studentUser._id,
        college: 'National Institute of Technology',
        department: 'Computer Science and Engineering',
        year: 3,
        enrollmentNumber: 'NIT2023CS042',
        skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Tailwind CSS', 'REST APIs'],
        bio: 'Passionate full-stack developer eager to build scalable web applications.',
        cgpa: 8.85,
      },
      { upsert: true, new: true }
    );

    // 4. Internships
    let internship = await Internship.findOne({ title: 'Full Stack Developer Intern', companyId: company._id });
    if (!internship) {
      internship = await Internship.create({
        companyId: company._id,
        createdBy: recruiterUser._id,
        title: 'Full Stack Developer Intern',
        description: 'Join our cloud team to build responsive modern dashboards and secure microservices.',
        skills: ['React', 'Node.js', 'Express', 'MongoDB'],
        eligibility: {
          minCgpa: 7.5,
          allowedBranches: ['Computer Science', 'Information Technology'],
          allowedYears: [3, 4],
          description: 'Basic knowledge of web development and Git.',
        },
        location: 'Hybrid (Bengaluru / Remote)',
        stipend: 25000,
        duration: '3 months',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
        preparationTips: ['Review asynchronous JavaScript and Promises', 'Understand RESTful API design principles'],
        technicalQuestions: ['Explain React component lifecycle vs Hooks', 'How does JWT authentication work?'],
        hrQuestions: ['Tell us about a challenging project you built', 'Why do you want to intern at TechFlow?'],
      });
    }

    // Second internship
    let internship2 = await Internship.findOne({ title: 'Frontend UI/UX Intern', companyId: company._id });
    if (!internship2) {
      await Internship.create({
        companyId: company._id,
        createdBy: recruiterUser._id,
        title: 'Frontend UI/UX Intern',
        description: 'Design and build intuitive user interfaces using React and modern CSS systems.',
        skills: ['React', 'Tailwind CSS', 'Figma', 'JavaScript'],
        eligibility: {
          minCgpa: 7.0,
          allowedBranches: ['Computer Science', 'Information Technology', 'Design'],
          allowedYears: [2, 3, 4],
          description: 'Portfolio of design or frontend projects required.',
        },
        location: 'Remote',
        stipend: 20000,
        duration: '2 months',
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
      });
    }

    // 5. Application
    let application = await Application.findOne({ studentId: studentUser._id, internshipId: internship._id });
    if (!application) {
      application = await Application.create({
        studentId: studentUser._id,
        internshipId: internship._id,
        status: 'SELECTED',
        notes: 'Shortlisted and offered internship role.',
      });
    }

    // 6. Offer
    let offer = await Offer.findOne({ applicationId: application._id });
    if (!offer) {
      offer = await Offer.create({
        applicationId: application._id,
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
    }

    // 7. Approval (TPO NOC)
    let approval = await Approval.findOne({ offerId: offer._id });
    if (!approval) {
      approval = await Approval.create({
        offerId: offer._id,
        studentId: studentUser._id,
        internshipId: internship._id,
        reviewedBy: tpoUser._id,
        status: 'APPROVED',
        nocIssued: true,
        remarks: 'Eligible and approved for academic credit.',
        reviewedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
      });
    }

    // 8. Internship Record (Live active tracking)
    let record = await InternshipRecord.findOne({ studentId: studentUser._id });
    if (!record) {
      record = await InternshipRecord.create({
        studentId: studentUser._id,
        internshipId: internship._id,
        companyId: company._id,
        offerId: offer._id,
        approvalId: approval._id,
        collegeMentorId: collegeMentorUser._id,
        companyMentorId: companyMentorUser._id,
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 69 * 24 * 60 * 60 * 1000),
        warningStatus: 'ON_TRACK',
        status: 'ACTIVE',
        roleTitle: 'Full Stack Developer Intern',
        skillsGained: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
        progressPercent: 35,
      });
    }

    // 9. Milestones
    await Milestone.deleteMany({ internshipRecordId: record._id });
    await Milestone.create([
      {
        internshipRecordId: record._id,
        companyMentorId: companyMentorUser._id,
        title: 'Milestone 1: Onboarding & Architecture Setup',
        description: 'Setup local environment, familiarize with repository, and implement auth module.',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        progress: 100,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        internshipRecordId: record._id,
        companyMentorId: companyMentorUser._id,
        title: 'Milestone 2: Dashboard and Analytics API',
        description: 'Build backend aggregation queries and integrate frontend charts.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        progress: 50,
        status: 'IN_PROGRESS',
      },
      {
        internshipRecordId: record._id,
        companyMentorId: companyMentorUser._id,
        title: 'Milestone 3: End-to-End Testing & Deployment',
        description: 'Write integration test cases and prepare CI/CD pipeline.',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        progress: 0,
        status: 'PENDING',
      },
    ]);

    // 10. Weekly Reports
    await WeeklyReport.deleteMany({ internshipRecordId: record._id });
    await WeeklyReport.create([
      {
        internshipRecordId: record._id,
        studentId: studentUser._id,
        weekNumber: 1,
        workSummary: 'Completed environment setup, configured Docker containers, and reviewed team code standards.',
        skillsUsed: ['Docker', 'Git', 'Linux'],
        learningOutcomes: 'Understood containerization workflow and internal CI/CD setup.',
        challenges: 'Minor port conflict resolved by updating configuration.',
        achievements: 'Passed initial onboarding checklist on schedule.',
        nextWeekGoals: 'Begin implementing authentication routes.',
        attendanceDays: 5,
        progressPercent: 100,
        status: 'VERIFIED',
        submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        mentorComment: 'Great start! Ready to tackle Milestone 2.',
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
        internshipRecordId: record._id,
        studentId: studentUser._id,
        weekNumber: 2,
        workSummary: 'Developed REST API endpoints for user profiles and validated JWT token flows.',
        skillsUsed: ['Express', 'JWT', 'Mongoose'],
        learningOutcomes: 'Deepened understanding of role-based access control and token verification.',
        challenges: 'Handling token expiry edge cases in Axios interceptors.',
        achievements: 'Delivered authentication endpoints with 95% test coverage.',
        nextWeekGoals: 'Integrate charts and analytics dashboard.',
        attendanceDays: 5,
        progressPercent: 70,
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

    console.log('\n========================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('Here are your test credentials for all 5 roles:\n');
    console.log('1. Student:');
    console.log('   Email:    student@demo.com');
    console.log('   Password: Password123!\n');
    console.log('2. Recruiter:');
    console.log('   Email:    recruiter@demo.com');
    console.log('   Password: Password123!\n');
    console.log('3. TPO Admin (College Placement Officer):');
    console.log('   Email:    tpo@demo.com');
    console.log('   Password: Password123!\n');
    console.log('4. College Mentor:');
    console.log('   Email:    college.mentor@demo.com');
    console.log('   Password: Password123!\n');
    console.log('5. Company Mentor:');
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
