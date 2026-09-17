# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for a Smart Internship Management and Monitoring System.

### 1.2 Scope
The system digitizes the internship lifecycle:
- Acquisition
- Execution
- Completion

It provides role-based workflows for students, institutions, college mentors, company recruiters, and company mentors.

## 2. User Roles

### Student
Owns the student journey: profile, discovery, applications, interviews, internship reports and completion submission.

### TPO/Admin
Manages institutional workflows, approvals, NOC, monitoring, mentor assignment and completion records.

### College Mentor
Monitors assigned students, reviews verified progress/reports, provides academic/institutional feedback and completion recommendation.

### Company Recruiter
Manages hiring: internship openings, applications, shortlisting, interview scheduling/evaluation, selection and offers.

### Company Mentor
Supervises interns: internship plan, report verification, progress and final company evaluation.

## 3. Functional Requirements

### 3.1 Authentication & RBAC
- Users shall register/login according to permitted roles.
- Passwords shall never be stored in plaintext.
- Authenticated requests shall be authorized server-side by role and resource ownership.
- Users shall not access another role's restricted dashboard or data.

### 3.2 Acquisition

#### Internship Discovery
- Students shall browse available internships.
- Students shall search/filter by relevant attributes such as company, role, location, stipend and deadline.
- Internship details shall show description, skills and eligibility.

#### Eligibility
- The system shall compare student profile attributes with internship eligibility criteria.
- The system shall display an eligibility result before application.
- Eligibility is an assistance mechanism and shall not replace recruiter decisions.

#### Preparation Hub
- Internship/role preparation may contain technical questions, HR questions, previous interview experiences and preparation resources.

#### Application
- Students shall submit applications with a resume.
- Students shall view their own application status.
- Recruiters shall view applicants for their internships.
- Recruiters shall shortlist/reject candidates.

#### Interview
- Recruiters shall schedule interviews with round, date/time and interview room.
- Authorized participants shall join the integrated Interview Workspace.
- The platform shall maintain interview status and metadata.
- Video/audio delivery shall be handled by the selected third-party video SDK/API rather than custom media infrastructure.

#### Selection & Offer
- Recruiters shall record selection and offer information.
- Offer letters shall be stored through secure file storage.
- Students shall view their offer information.

#### Institutional Verification & NOC
- TPO/Admin shall review selected internship/offer information.
- TPO/Admin shall approve/reject institutional participation.
- Approved internships shall support NOC generation/storage.

### 3.3 Execution

#### Internship Plan & Milestones
- An active internship shall have milestones.
- Company mentors may define/update expected milestones.
- Students may update milestone progress/status without changing the underlying definition improperly.

#### Weekly Reports
Students shall submit structured weekly reports containing:
- Week number/date range
- Work summary
- Skills used
- Learning outcomes
- Challenges
- Achievements
- Next-week goals
- Attendance information
- Progress

Report states:
- Draft
- Submitted
- Revision Required
- Verified

#### AI Confidentiality Guard
Before a weekly report is shared for institutional monitoring:
- The system shall check for potential API keys, passwords/tokens, PII/customer data, financial/transaction data, internal URLs/endpoints, source-code snippets, internal project details and NDA/confidentiality references.
- The system shall return a risk level and flagged categories/items where applicable.
- The student shall be able to edit and resubmit.
- AI shall flag; it shall not autonomously reject or approve a report.
- AI credentials shall remain server-side.

#### Company Mentor Verification
- Company mentors shall view assigned interns' reports.
- They shall verify or request revision.
- They may add a concise comment.
- Verification history shall be auditable.

#### TPO Monitoring
TPO/Admin shall see institutional signals:
- Active internships
- Report status
- Mentor verification status
- Progress
- Attendance if implemented
- Internship end dates
- Early-warning status

TPO/Admin shall not need proprietary company project details.

#### Early Warning
The system shall derive objective warning signals such as:
- Missed/overdue weekly report
- Pending mentor verification
- Declining/insufficient progress
- Repeated revision requests
- Internship nearing end without required reports/milestones

Risk labels:
- On Track
- Needs Attention
- At Risk

The system flags; authorized institutional staff decide follow-up.

### 3.4 Completion
- Students shall submit final report/presentation/certificate and summary/skills.
- Company mentors shall provide final evaluation.
- College mentors shall review and provide recommendation/remarks.
- TPO/Admin shall approve completion.
- The system shall maintain a digital internship record.
- Internship outcome may record completed, PPO, extended or no offer.

## 4. Non-Functional Requirements

### Security
- HTTPS in deployment.
- Password hashing.
- JWT/session security.
- Server-side authorization.
- Private file access where appropriate.
- API secrets only on the server.
- Input validation and file-type/size restrictions.
- Audit timestamps for important workflow actions.

### Privacy
- Minimize company-confidential data collection.
- Do not require source code or internal documents.
- Restrict report/evaluation visibility by role.
- Store only necessary AI check results.

### Scalability
- Modular REST API.
- Stateless backend where practical.
- Database indexes on common query fields.
- Third-party services used for video and file storage.

### Performance
- Paginate large lists.
- Avoid unnecessary repeated database/API calls.
- Use optimized queries and indexes.
- Keep video traffic off the application server.

### Usability
- Responsive UI.
- Clear status badges.
- Simple workflows.
- Role-specific dashboards.

## 5. Constraints
- Hackathon MVP prioritizes core lifecycle workflows.
- Notifications, chat, GPS and advanced surveillance are excluded.
- Integrated video is implemented through a third-party SDK/API.
- Exact third-party API behavior must be validated against current provider documentation during implementation.

## 6. Acceptance Criteria
A demo is successful when:
1. A student discovers and applies to an internship.
2. Recruiter reviews and shortlists the student.
3. Recruiter schedules an interview.
4. Student and recruiter can enter the Interview Workspace.
5. Recruiter selects the student and provides an offer.
6. TPO verifies and issues/stores NOC.
7. Student submits a weekly report.
8. AI Confidentiality Guard flags or clears the report.
9. Company mentor verifies it.
10. TPO/college mentor can monitor internship health.
11. Student submits final documents.
12. Mentor evaluates and TPO completes the internship record.
