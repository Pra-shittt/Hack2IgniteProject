# Product & UI/UX Design Specification

## 1. Design Goal
A professional institutional SaaS product: modern, trustworthy, clean and data-oriented. The interface should feel like a real platform rather than a collection of hackathon forms.

## 2. Design Principles
- Clarity over decoration
- Role-specific information
- Minimal clicks for frequent workflows
- Strong visual hierarchy
- Consistent status indicators
- Responsive design
- Accessible forms and readable tables
- Avoid unnecessary animations

## 3. Visual System
Use a restrained professional palette:
- Primary: deep blue/indigo family
- Success: green
- Warning: amber
- Danger: red
- Neutral surfaces: white/light gray with dark text
- Dark mode is optional and not required for MVP

Use one modern sans-serif font consistently.

Cards:
- Moderate border radius
- Subtle border/shadow
- Clear headings
- Compact but breathable spacing

## 4. Navigation

### Student
Sidebar/top navigation:
- Dashboard
- Internships
- Applications
- Preparation
- Interviews
- My Internship
- Final Submission
- Internship Record
- Profile

### TPO/Admin
- Dashboard
- Students
- Companies
- Internships
- Approvals/NOC
- Internship Monitoring
- Completion

### College Mentor
- Dashboard
- My Students
- Student/Internship Details
- Final Review

### Recruiter
- Dashboard
- My Internships
- Applications
- Candidates
- Interviews
- Offers

### Company Mentor
- Dashboard
- My Interns
- Reports
- Evaluations

## 5. Dashboard Design

### Student Dashboard
Show:
- Active applications
- Upcoming interview
- Current internship
- Weekly report status
- Progress
- Attention items

### TPO Dashboard
Prioritize:
- Total/active/completed internships
- Pending approvals
- Pending mentor verification
- Reports overdue
- At-risk internships
- Internship completion
- "What Needs My Attention?" section

### Recruiter Dashboard
Show:
- Open internships
- Applications
- Shortlisted candidates
- Upcoming interviews
- Selected candidates

### Company Mentor Dashboard
Show:
- Assigned interns
- Reports awaiting verification
- Internships ending soon
- Progress/attention items

### College Mentor Dashboard
Show:
- Assigned students
- Active internships
- Pending reviews
- At-risk students

## 6. Acquisition Screens

### Internship Marketplace
- Search
- Filters
- Internship cards
- Eligibility badge
- Deadline
- Apply CTA

### Internship Details
Sections:
- Company
- Role
- Description
- Skills
- Eligibility
- Duration
- Stipend
- Preparation
- Apply

### Application Tracker
Use a clear lifecycle indicator:
Applied → Shortlisted → Interview → Selected → Offer

### Interview
Show:
- Round
- Date/time
- Participants
- Status
- Join Interview button

## 7. Interview Workspace
Primary screen:
- Video area
- Participant area
- Interview details
- Candidate profile/resume summary
- Basic interviewer notes/evaluation

Do not overcrowd the call UI. Video functionality should remain the visual focus.

## 8. Execution Screens

### My Internship
- Company
- Role
- Dates
- Company mentor
- College mentor
- Milestones
- Overall progress
- Weekly report history

### Weekly Report
Use a structured form:
- Week/date
- Work summary
- Skills
- Learning
- Challenges
- Achievements
- Next goals
- Attendance
- Progress

After confidentiality checking, show:
- Safe/low-risk state
- Flagged categories
- Edit/resubmit CTA

### Mentor Review
Use a focused review layout:
- Report content
- Confidentiality result
- Verify
- Request Revision
- Comment

## 9. Completion Screens
### Final Submission
Upload required documents and enter final summary/skills.

### Completion Review
Show:
- Final submission
- Company evaluation
- College mentor recommendation
- Completion approval

### Internship Record
Show a clean certificate-like summary:
- Company
- Role
- Duration
- Skills
- Completion status
- Outcome

## 10. Status Language
Use consistent statuses:
- On Track
- Needs Attention
- At Risk
- Pending
- Submitted
- Revision Required
- Verified
- Approved
- Rejected
- Completed

## 11. Responsive Behavior
Desktop-first for TPO/company dashboards because tables are information-dense. Student views must remain usable on mobile. Collapse sidebars and convert tables to cards on narrow screens.

## 12. UX Guardrails
- Confirm destructive actions.
- Show upload limits before upload.
- Display loading/error/empty states.
- Preserve form drafts where practical.
- Never expose restricted role data just because a route is manually entered.
