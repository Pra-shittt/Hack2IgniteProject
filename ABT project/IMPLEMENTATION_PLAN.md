# Implementation Plan

## 1. Principle
Build the smallest complete vertical slice first. Do not build every screen before connecting the backend.

## 2. Phase 0 — Repository Setup
- Initialize React/Vite frontend.
- Initialize Node/Express backend.
- Configure Tailwind.
- Configure MongoDB/Prisma.
- Add environment variable handling.
- Configure Git and basic README.
- Create shared API client/error handling.

## 3. Phase 1 — Authentication & RBAC
Build:
- Login/register
- Password hashing
- JWT/session
- User roles
- Protected routes
- Backend authorization middleware
- Role-specific dashboard redirects

Acceptance:
Each of the five roles can log in and sees only its permitted area.

## 4. Phase 2 — Company & Internship Acquisition
Build:
- Company data
- Recruiter company association
- Create internship
- Internship marketplace
- Internship detail
- Search/filter
- Basic eligibility
- Student application
- Recruiter application list
- Shortlisting/status

Acceptance:
Student can discover/apply and recruiter can process the application.

## 5. Phase 3 — Interview Workspace
Build:
- Interview scheduling
- Interview list/details
- Provider integration
- Room authorization
- Student join flow
- Recruiter/interviewer join flow
- Basic interview status
- Basic evaluation

Acceptance:
Two authorized users can enter the same interview room in a deployed environment.

Do not build custom WebRTC/media infrastructure.

## 6. Phase 4 — Offer + College Approval/NOC
Build:
- Selection
- Offer upload
- Student offer view
- TPO approval
- NOC generation/storage

Acceptance:
Selected application can become an approved internship.

## 7. Phase 5 — Execution
Build:
- Internship record
- Mentor assignment
- Milestones
- Weekly report form
- Student report history
- Company mentor review

Acceptance:
Student submits a report and company mentor can verify/request revision.

## 8. Phase 6 — AI Confidentiality Guard
Build:
- Backend AI service wrapper
- Prompt/instructions focused on confidentiality
- Structured response parser
- Risk level/categories
- Student warning UI
- Resubmission workflow

Acceptance:
A test report containing obvious sensitive patterns is flagged; normal text is not falsely treated as guaranteed safe. AI result is advisory.

Fallback:
If AI provider is unavailable, the application must not fabricate a successful check.

## 9. Phase 7 — Monitoring + Early Warning
Build:
- TPO dashboard
- College mentor dashboard
- Progress calculation
- Warning rules
- At-risk list
- Report/verification status

Acceptance:
Test data produces meaningful On Track / Needs Attention / At Risk states.

## 10. Phase 8 — Completion
Build:
- Final submission
- Company evaluation
- College mentor review
- TPO completion approval
- Digital internship record
- Outcome/PPO

Acceptance:
A complete internship can be closed and viewed as a historical record.

## 11. Phase 9 — Optional Features
Only after all core acceptance criteria pass:
1. Attendance enhancements
2. Learning Journey visualization
3. QR verification

Do not build notifications.

## 12. Phase 10 — Hardening
- Validate all forms
- Role/ownership testing
- File validation
- Loading/error/empty states
- Responsive checks
- Seed/demo data
- Deployment
- Demo rehearsal

## 13. Recommended Build Order
1. Auth/RBAC
2. Internship + application
3. Interview
4. Offer + NOC
5. Internship record + milestones
6. Weekly reports + mentor verification
7. AI guard
8. TPO monitoring + early warning
9. Completion
10. Optional polish

## 14. Demo Data
Create realistic seeded data:
- Several students
- Multiple companies
- Open internships
- Applications in different states
- Upcoming interview
- Active internship
- Verified and revision-requested reports
- One needs-attention case
- One at-risk case
- Completed internship
- PPO outcome

## 15. Demo Flow
Recommended end-to-end demonstration:
Student discovers internship → applies → recruiter shortlists → recruiter schedules → both enter Interview Workspace → recruiter selects → offer → TPO approval/NOC → internship starts → student submits weekly report → confidentiality guard → company mentor verifies → TPO dashboard updates → final submission → evaluations → completion record.

## 16. Deployment
Target:
- Frontend: Vercel
- Backend: Render
- MongoDB: Atlas
- Files: Cloudinary
- Video: ZEGO Cloud
- AI: chosen provider

Keep environment-specific secrets out of Git.

## 17. Definition of Done
A feature is done only when:
- UI exists
- API exists
- Backend validation exists
- Authorization exists
- Database persistence works
- Loading/error states exist
- Happy path works on deployed app
- At least one negative/permission case is tested
