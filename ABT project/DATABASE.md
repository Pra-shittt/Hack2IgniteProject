# Database Design

## 1. Database
MongoDB Atlas.

The application uses a document model. Prisma may be used as the data access layer after validating compatibility with the selected MongoDB configuration.

## 2. Collections

### users
Common authentication/identity.
Fields:
- _id
- name
- email
- passwordHash
- role
- phone
- avatar
- isActive
- createdAt
- updatedAt

Roles:
STUDENT, TPO_ADMIN, COLLEGE_MENTOR, RECRUITER, COMPANY_MENTOR

### student_profiles
- _id
- userId
- college
- department
- year
- enrollmentNumber
- skills[]
- resumeUrl
- bio
- createdAt
- updatedAt

### companies
- _id
- name
- logoUrl
- website
- description
- industry
- location
- createdAt
- updatedAt

### internships
- _id
- companyId
- createdBy
- title
- description
- skills[]
- eligibility
- location
- stipend
- duration
- applicationDeadline
- status
- createdAt
- updatedAt

Status:
DRAFT, OPEN, CLOSED

### applications
- _id
- studentId
- internshipId
- resumeUrl
- status
- appliedAt
- updatedAt
- recruiterRemarks

Status:
APPLIED, SHORTLISTED, INTERVIEW, SELECTED, REJECTED, OFFERED

### interviews
- _id
- applicationId
- recruiterId
- scheduledBy
- round
- scheduledAt
- roomId
- status
- notes
- createdAt
- updatedAt

Status:
SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

### offers
- _id
- applicationId
- studentId
- internshipId
- offerLetterUrl
- startDate
- endDate
- status
- issuedAt
- createdAt

### approvals
- _id
- offerId
- studentId
- internshipId
- status
- reviewedBy
- remarks
- nocUrl
- reviewedAt
- createdAt

Status:
PENDING, APPROVED, REJECTED

### internship_records
Represents an actual approved internship instance.
- _id
- studentId
- internshipId
- companyId
- companyMentorId
- collegeMentorId
- startDate
- endDate
- status
- overallProgress
- createdAt
- updatedAt

Status:
UPCOMING, ACTIVE, COMPLETED, TERMINATED

### milestones
- _id
- internshipRecordId
- title
- description
- dueDate
- progress
- status
- createdAt
- updatedAt

Status:
NOT_STARTED, IN_PROGRESS, COMPLETED

### weekly_reports
- _id
- internshipRecordId
- studentId
- weekNumber
- startDate
- endDate
- workSummary
- skillsUsed[]
- learningOutcomes
- challenges
- achievements
- nextWeekGoals
- attendance
- progress
- status
- submittedAt
- updatedAt

Status:
DRAFT, SUBMITTED, REVISION_REQUIRED, VERIFIED

### report_reviews
- _id
- weeklyReportId
- mentorId
- status
- comment
- reviewedAt

Status:
VERIFIED, REVISION_REQUIRED

### confidentiality_checks
- _id
- weeklyReportId
- riskLevel
- flaggedCategories[]
- flaggedItems[]
- suggestion
- checkedAt

Risk:
SAFE, LOW, MEDIUM, HIGH

### final_submissions
- _id
- internshipRecordId
- studentId
- finalReportUrl
- presentationUrl
- certificateUrl
- summary
- skillsLearned[]
- status
- submittedAt
- updatedAt

Status:
SUBMITTED, UNDER_REVIEW, APPROVED, REVISION_REQUIRED

### evaluations
Supports company and college evaluations.
- _id
- internshipRecordId
- evaluatorId
- evaluatorRole
- ratings
- feedback
- submittedAt

Evaluator role:
COMPANY_MENTOR, COLLEGE_MENTOR

### internship_outcomes
- _id
- internshipRecordId
- outcome
- remarks
- recordedBy
- createdAt

Outcome:
COMPLETED, PPO, EXTENDED, NO_OFFER

## 3. Key Relationships
User → Student Profile
Company → Internships
Student + Internship → Application
Application → Interview
Application → Offer
Offer → Approval
Approved Offer → Internship Record
Internship Record → Milestones
Internship Record → Weekly Reports
Weekly Report → Confidentiality Check
Weekly Report → Mentor Review
Internship Record → Final Submission
Internship Record → Evaluations
Internship Record → Outcome

## 4. Access/Ownership Summary
- Student: own profile, applications, reports and submissions.
- Recruiter: own company's internships, applicants, interviews, selection and offers.
- Company Mentor: assigned interns, reports, progress and final evaluation.
- College Mentor: assigned students, verified progress/reports and academic review.
- TPO/Admin: institution-level management, approvals, monitoring and completion.

## 5. Privacy
Do not store source code, internal company documents or unnecessary confidential company material as part of the normal workflow.

## 6. Indexes
Recommended:
- unique users.email
- applications on {studentId, internshipId}
- internships on {status, applicationDeadline}
- interviews on {scheduledAt}
- weekly_reports on {internshipRecordId, weekNumber}
- internship_records on {studentId, status}
- milestones on {internshipRecordId, status}

Add compound/unique constraints only after validating exact MongoDB/Prisma implementation.
