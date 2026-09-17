# API Specification

## 1. Conventions
Base path: `/api`
Use JSON for normal requests/responses.
Use multipart/form-data for file uploads.
Protected endpoints require authentication and server-side role/ownership checks.

## 2. Authentication

POST /api/auth/register
- Public
- Creates permitted user account.

POST /api/auth/login
- Public
- Returns authenticated session/token.

GET /api/auth/me
- Authenticated
- Returns current user and permitted profile information.

## 3. Internships

GET /api/internships
- Student/TPO/Recruiter as appropriate
- Search/filter/list internships.

GET /api/internships/:id
- Authenticated
- View internship details according to access rules.

POST /api/internships
- Recruiter
- Create internship.

PATCH /api/internships/:id
- Owner Recruiter/TPO where permitted
- Update internship.

PATCH /api/internships/:id/status
- Owner Recruiter/TPO
- Open/close internship.

## 4. Applications

POST /api/applications
- Student
- Apply to internship.

GET /api/applications/my
- Student
- Own applications.

GET /api/internships/:id/applications
- Recruiter
- Applicants for own internship.

PATCH /api/applications/:id/status
- Recruiter
- Shortlist/reject/select/update hiring status.

## 5. Interviews

POST /api/interviews
- Recruiter
- Schedule interview.

GET /api/interviews/my
- Student/Recruiter
- Relevant scheduled interviews.

GET /api/interviews/:id
- Authorized participant/staff
- Interview details.

POST /api/interviews/:id/join
- Authorized participant
- Obtain/prepare provider-specific room access.

PATCH /api/interviews/:id/status
- Authorized recruiter/interviewer
- Update interview status.

## 6. Offers

POST /api/offers
- Recruiter
- Create/upload offer information.

GET /api/offers/my
- Student
- Own offer.

GET /api/offers/:id
- Authorized student/recruiter/TPO/assigned mentor as appropriate.

## 7. Approvals/NOC

POST /api/approvals
- Student/system workflow
- Submit selected internship for institutional review.

GET /api/approvals
- TPO/Admin
- Pending approvals.

PATCH /api/approvals/:id
- TPO/Admin
- Approve/reject and add remarks.

POST /api/approvals/:id/noc
- TPO/Admin
- Generate/store NOC.

## 8. Internship Records

GET /api/internship-records/my
- Student
- Own internship record.

GET /api/internship-records/:id
- Authorized assigned/institutional users
- View permitted record.

POST /api/internship-records/:id/milestones
- Company Mentor
- Add milestone.

PATCH /api/milestones/:id
- Company Mentor/student as permitted
- Update milestone/progress.

## 9. Weekly Reports

POST /api/weekly-reports
- Student
- Create report.

GET /api/weekly-reports/my
- Student
- Own reports.

GET /api/internship-records/:id/weekly-reports
- Assigned Company Mentor/College Mentor/TPO according to visibility.

PATCH /api/weekly-reports/:id
- Student
- Edit draft or revision-requested report.

POST /api/weekly-reports/:id/submit
- Student
- Submit report and trigger confidentiality workflow.

## 10. Confidentiality

POST /api/confidentiality/check
- Backend-internal or authorized report workflow
- Runs AI check for a weekly report.

GET /api/weekly-reports/:id/confidentiality
- Student/Company Mentor as appropriate
- View check result.

AI provider credentials are never exposed to frontend.

## 11. Mentor Review

POST /api/weekly-reports/:id/review
- Company Mentor
- Verify or request revision.

GET /api/company-mentor/reports/pending
- Company Mentor
- Reports awaiting action.

## 12. Dashboards

GET /api/tpo/dashboard
- TPO/Admin
- Institutional summary and warning signals.

GET /api/mentor/dashboard
- College Mentor
- Assigned students and status.

GET /api/recruiter/dashboard
- Recruiter
- Hiring summary.

GET /api/company-mentor/dashboard
- Company Mentor
- Internship supervision summary.

GET /api/student/dashboard
- Student
- Personal lifecycle summary.

## 13. Completion

POST /api/final-submissions
- Student
- Submit final documents.

GET /api/final-submissions/:internshipRecordId
- Authorized users
- View submission.

POST /api/evaluations
- Company Mentor/College Mentor
- Submit respective evaluation.

POST /api/internship-outcomes
- Authorized Company Mentor/Recruiter/TPO
- Record outcome.

PATCH /api/internship-records/:id/complete
- TPO/Admin
- Mark institutional completion after required checks.

## 14. Error Format
Use a consistent shape:
{
  "success": false,
  "message": "Human-readable message",
  "code": "ERROR_CODE"
}

## 15. Security
Every mutation must verify:
1. Authentication
2. Role
3. Resource ownership/assignment
4. Input validation
5. Allowed state transition
