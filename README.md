# Smart Internship Management & Monitoring System

A full-stack hackathon-ready web application that manages the complete internship lifecycle — from discovery to completion — with AI-powered confidentiality protection.

## 🎯 Key Features

- **Internship Marketplace** — Students browse, filter, and apply to internships
- **Interview Workspace** — Live video interviews via ZEGO Cloud
- **AI Confidentiality Guard** — Gemini AI scans weekly reports for sensitive data before college submission
- **Execution Monitoring** — Milestone tracking, weekly reports, mentor verification
- **Early Warning System** — Automatic ON_TRACK / NEEDS_ATTENTION / AT_RISK signals for TPO
- **Completion Workflow** — 4-step process: student submits → company evaluates → college reviews → TPO approves
- **Digital Internship Record** — Visual learning journey with skill analytics

## 👥 User Roles

| Role | Responsibilities |
|---|---|
| **Student** | Discover, apply, attend interviews, submit reports, view digital record |
| **TPO Admin** | Approve NOC, monitor all students, final completion approval |
| **College Mentor** | Monitor assigned students, write final recommendations |
| **Recruiter** | Post internships, manage applications, schedule interviews, issue offers |
| **Company Mentor** | Define milestones, verify weekly reports, final evaluation |

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcrypt |
| File Storage | Cloudinary |
| Video | ZEGO Cloud |
| AI | Google Gemini 1.5 Flash |
| Deployment | Vercel (frontend) + Render (backend) |

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- ZEGO Cloud account (optional for video)
- Google Gemini API key (optional — AI check gracefully skips if not set)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env with your credentials
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# Create frontend/.env with:
# VITE_API_URL=http://localhost:5000/api
npm run dev
```

App runs at **http://localhost:5173**

### 🔑 Demo Logins (Pre-seeded)

Run `npm run seed` inside `backend` to populate the database with realistic demo data and the following accounts (Password for all: `Password123!`):

| Role | Email | Password | What You Can Test |
|---|---|---|---|
| **Student** | `student@demo.com` | `Password123!` | Marketplace, Apply, Submit Reports, Milestones, Digital Record |
| **Recruiter** | `recruiter@demo.com` | `Password123!` | Post Internships, View Applications, Issue Offers, Schedule Interviews |
| **TPO Admin** | `tpo@demo.com` | `Password123!` | Approval Center (NOC), Early Warning Monitoring, Final Approvals |
| **College Mentor** | `college.mentor@demo.com` | `Password123!` | Track Assigned Students, Performance Monitoring, Recommendations |
| **Company Mentor** | `company.mentor@demo.com` | `Password123!` | Review & Verify Weekly Reports, Milestone Tracking, Final Evaluation |

> **Note:** You can also register your own **Student**, **Recruiter**, or **Company Mentor** account directly on the `/register` page. TPO and College Mentor roles are seeded for security.


## 📦 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB Atlas
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ZEGO Cloud (Video Interview)
ZEGO_APP_ID=your-zego-app-id
ZEGO_SERVER_SECRET=your-zego-server-secret

# Google Gemini AI (optional — AI check skipped if not set)
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_ZEGO_APP_ID=your-zego-app-id
```

## 🌐 Deployment

### Frontend → Vercel

1. Connect the `/frontend` directory to Vercel
2. Set `VITE_API_URL` to your Render backend URL
3. `vercel.json` is pre-configured for SPA routing

### Backend → Render

1. Connect the `/backend` directory to Render
2. Use the `render.yaml` file
3. Set all environment variables in Render dashboard
4. Set `FRONTEND_URL` to your Vercel frontend URL

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic (12 controllers)
│   │   ├── models/         # Mongoose models (12 models)
│   │   ├── routes/         # Express routes (15 route files)
│   │   ├── middleware/     # Auth, RBAC, validation, error handling
│   │   ├── utils/          # Confidentiality Guard (Gemini AI)
│   │   └── config/         # DB, Cloudinary config
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── auth/           # Login, Register
        │   ├── dashboards/     # Role-specific dashboards
        │   ├── student/        # 7 student pages
        │   ├── recruiter/      # 4 recruiter pages
        │   ├── tpo/            # 3 TPO pages
        │   ├── college/        # College mentor pages
        │   ├── company/        # Company mentor pages
        │   └── interviews/     # Interview workspace (ZEGO)
        ├── components/         # Shared layout, sidebar
        ├── services/           # API client (axios)
        └── context/            # Auth context (JWT)
```

## 🔐 Security

- All routes protected with JWT middleware
- Backend enforces RBAC for every endpoint
- Resource ownership checked before data access
- AI API key never exposed to frontend
- Environment variables for all secrets
- Input validation on critical endpoints

## 🤖 AI Confidentiality Guard

Weekly reports are scanned by Gemini 1.5 Flash before entering the monitoring workflow:

- Returns `riskLevel`: SAFE / LOW / MEDIUM / HIGH
- Flags categories: API keys, passwords, credentials, customer data, source code, etc.
- Student sees a warning and can edit before mentor sees the report
- Gracefully skips if `GEMINI_API_KEY` is not configured

## 🏆 Internship Completion Workflow

```
Student Final Submission
    ↓
Company Mentor Evaluation (5-criteria star rating)
    ↓
College Mentor Recommendation
    ↓
TPO Approval
    ↓
Digital Internship Record (with learning journey analytics)
```
