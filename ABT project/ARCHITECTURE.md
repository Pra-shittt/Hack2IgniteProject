# System Architecture

## 1. Architecture Style
A modular monolithic web application is preferred for the hackathon:
- React frontend
- Node.js/Express backend
- MongoDB database
- External services for files, AI and video

Do not introduce microservices unless a concrete requirement appears.

## 2. High-Level Architecture

Users
→ React + Vite frontend
→ HTTPS REST API
→ Node.js + Express
→ Prisma/data access layer
→ MongoDB Atlas

External integrations:
- Cloudinary for files
- AI API for confidentiality checks
- ZEGO Cloud SDK/API for interview video

## 3. Frontend Architecture

Suggested:
src/
- components/
- pages/
- layouts/
- services/
- hooks/
- context/
- utils/
- routes/

Responsibilities:
- Presentation
- Client-side routing
- Form handling
- UI state
- Calling backend APIs
- Role-aware rendering

Do not place authorization/business rules only in frontend.

## 4. Backend Architecture

Suggested:
server/
- routes/
- controllers/
- services/
- middleware/
- models/ or prisma/
- validators/
- utils/
- config/

Flow:
Route → Authentication middleware → Authorization middleware → Validation → Controller → Service → Data layer → Response

## 5. Authentication
- Login validates credentials.
- Backend issues secure authentication token/session.
- Protected API routes require authentication.
- Role middleware enforces RBAC.
- Resource ownership/assignment must also be checked.

Example:
Student can update only their own application/report.
Company mentor can verify only assigned intern reports.

## 6. API Modules
- /api/auth
- /api/users
- /api/students
- /api/companies
- /api/internships
- /api/applications
- /api/interviews
- /api/offers
- /api/approvals
- /api/internship-records
- /api/milestones
- /api/weekly-reports
- /api/confidentiality
- /api/evaluations
- /api/final-submissions
- /api/outcomes

## 7. Database
MongoDB Atlas stores application data. Prisma may be used as the application data layer after confirming the selected Prisma/MongoDB configuration supports the required relations and operations.

Important indexes:
- users.email
- internships.status/deadline
- applications.studentId/internshipId
- interviews.scheduledAt
- weekly_reports.internshipRecordId/weekNumber
- internship_records.studentId/status

## 8. File Storage
Upload flow:
Frontend → Backend → Cloudinary → returned URL/reference → MongoDB

Files:
- Resume
- Offer letter
- NOC
- Final report
- Presentation
- Certificate

Apply file type/size validation.

## 9. Interview Architecture
Application backend manages:
- interview record
- schedule
- room identifier
- participant authorization
- status

ZEGO Cloud handles real-time media.

Browser:
Student ↔ ZEGO Cloud ↔ Recruiter/Interviewer

The application server must not relay video streams.

Provider integration must be verified against current ZEGO documentation before implementation.

## 10. AI Confidentiality Architecture
Frontend submits weekly report to backend.
Backend sends relevant report content to AI provider.
Backend validates/sanitizes the response.
Backend stores a compact confidentiality result.
Frontend receives result.

AI provider must never receive application secrets or unrelated student/company data.

## 11. Early Warning Architecture
Prefer deterministic rules in the MVP.

Example:
- overdue report → warning
- pending mentor verification → warning
- insufficient progress → warning
- repeated revisions → warning
- internship nearing end + incomplete reports → warning

Aggregate signals into:
ON_TRACK
NEEDS_ATTENTION
AT_RISK

## 12. Progress
Progress should be derived from milestone state where possible rather than blindly trusting a manually entered overall percentage.

## 13. Security Boundaries
- Secrets only in server environment variables.
- Backend validates all inputs.
- Role and ownership checks on every protected mutation.
- Never trust client-supplied role.
- Avoid returning unnecessary private fields.
- Secure file URLs/access where feasible.

## 14. Deployment
Recommended hackathon deployment:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Files: Cloudinary
- Video: ZEGO Cloud
- AI: selected AI provider

Keep deployment simple and avoid Kubernetes/Docker unless already required by the team.

## 15. Failure Handling
External services can fail. The UI should show meaningful errors.
- Video service unavailable → show join/integration error
- AI unavailable → report can be marked "check unavailable" and routed according to configured safety policy rather than pretending it was checked
- File upload failure → allow retry
- Database/API error → show retry/error state
