# Smart Internship Management & Monitoring System — Project Context

## 1. Problem Statement
> Develop a Smart Internship Management and Monitoring System that enables institutions to digitally monitor and manage the complete internship lifecycle of students through a single, secure and scalable platform.

## 2. Vision
Create a single platform covering the internship lifecycle from discovery and application through interview, institutional approval, internship execution, verification, and completion.

## 3. Core Lifecycle
1. Acquisition — pre-internship
2. Execution — during internship
3. Completion — post-internship

## 4. Users
- Student
- TPO/Admin
- College Mentor
- Company Recruiter
- Company Mentor

Recruiter and Company Mentor are intentionally separate:
- Recruiter: hiring/acquisition
- Company Mentor: internship supervision/execution/completion

## 5. Final Feature Scope

### Acquisition
- Internship discovery and filters
- Eligibility check
- Preparation hub
- Apply + application tracker
- Interview scheduling
- Integrated Interview Workspace
- Selection + offer letter
- College verification + NOC

### Execution
- Internship plan/milestones
- Weekly reports
- AI Confidentiality Guard
- Company mentor verification
- TPO monitoring dashboard
- Early warning system
- Progress tracking

### Completion
- Final submission
- Company mentor evaluation
- College mentor review
- TPO completion approval
- Digital internship record
- Internship outcome/PPO tracking

### Optional only if core functionality is complete
- Attendance
- Learning Journey
- QR verification

## 6. Deliberately Out of Scope
- Chat system
- Notification system
- GPS/geofencing
- Payroll/stipend management
- Full HRMS
- Employee surveillance
- Source-code monitoring
- Company confidential project monitoring
- Daily reporting
- AI performance scoring
- Full custom video-conferencing infrastructure
- AI cheating/facial analysis
- Kubernetes/microservices complexity

## 7. Privacy Principle
The institution needs internship-health and compliance information, not proprietary company information. Students should not be required to submit source code, internal documents, client information, credentials, internal project specifications, or other confidential company material.

## 8. Key Differentiators
1. Integrated Interview Workspace: interviews can be conducted inside the platform using a video SDK/API such as ZEGO Cloud, while the platform handles scheduling, access and interview metadata.
2. AI Confidentiality Guard: checks weekly reports for possible confidential information before institutional sharing. AI flags potential risks; it does not make the final decision.
3. Early Warning Dashboard: surfaces objective internship-health signals requiring attention.

## 9. Recommended Hackathon Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB Atlas
- ORM/data layer: Prisma, subject to compatibility validation with the selected MongoDB setup
- Authentication: JWT + bcrypt
- File storage: Cloudinary
- Video: ZEGO Cloud SDK/API
- AI: server-side AI API
- Deployment target: Vercel (frontend), Render (backend), MongoDB Atlas (database), Cloudinary (files)

## 10. Core Product Statement
The student reports, the company verifies, the AI protects confidential information, and the college gets a real-time picture of internship health and early warnings when something goes off-track.
