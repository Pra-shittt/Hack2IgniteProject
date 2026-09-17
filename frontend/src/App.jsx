import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, PublicRoute } from './routes/Guards';
import DashboardRouter from './routes/DashboardRouter';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboards
import StudentDashboard from './pages/dashboards/StudentDashboard';
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard';
import TPODashboard from './pages/dashboards/TPODashboard';
import CollegeMentorDashboard from './pages/dashboards/CollegeMentorDashboard';
import CompanyMentorDashboard from './pages/dashboards/CompanyMentorDashboard';

// Student pages
import InternshipMarketplace from './pages/student/InternshipMarketplace';
import InternshipDetail from './pages/student/InternshipDetail';
import ApplicationTracker from './pages/student/ApplicationTracker';
import PreparationHub from './pages/student/PreparationHub';
import ProfilePage from './pages/student/ProfilePage';
import MyInternshipPage from './pages/student/MyInternshipPage';
import FinalSubmissionPage from './pages/student/FinalSubmissionPage';

// Interview pages
import InterviewList from './pages/interviews/InterviewList';
import InterviewDetail from './pages/interviews/InterviewDetail';
import InterviewWorkspace from './pages/interviews/InterviewWorkspace';

// Recruiter pages
import RecruiterInternships from './pages/recruiter/RecruiterInternships';
import InternshipForm from './pages/recruiter/InternshipForm';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';
import ManageOffersPage from './pages/recruiter/ManageOffersPage';

// TPO pages
import MonitoringPage from './pages/tpo/MonitoringPage';
import ApprovalCenterPage from './pages/tpo/ApprovalCenterPage';
import CompletionReviewPage from './pages/tpo/CompletionReviewPage';

// College Mentor pages
import MyStudentsPage from './pages/college/MyStudentsPage';

// Company Mentor pages
import MyInternsPage from './pages/company/MyInternsPage';
import FinalEvaluationPage from './pages/company/FinalEvaluationPage';

// Simple placeholder for unimplemented routes
const Placeholder = ({ title }) => (
  <div className="card" style={{ textAlign: 'center', padding: 60 }}>
    <h2 style={{ color: '#64748b', fontSize: '1.2rem' }}>{title}</h2>
    <p style={{ color: '#94a3b8', marginTop: 8 }}>Coming soon.</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Authenticated routes */}
          <Route element={<PrivateRoute />}>
            {/* Interview Workspace - full screen, no sidebar */}
            <Route path="/interviews/:id/workspace" element={<InterviewWorkspace />} />

            {/* Dashboard with sidebar */}
            <Route element={<DashboardLayout />}>
              {/* Smart dashboard redirect */}
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
              <Route path="/tpo-dashboard" element={<TPODashboard />} />
              <Route path="/mentor-dashboard" element={<CollegeMentorDashboard />} />
              <Route path="/company-mentor-dashboard" element={<CompanyMentorDashboard />} />

              {/* Student routes */}
              <Route path="/internships" element={<InternshipMarketplace />} />
              <Route path="/internships/:id" element={<InternshipDetail />} />
              <Route path="/applications" element={<ApplicationTracker />} />
              <Route path="/preparation" element={<PreparationHub />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-internship" element={<MyInternshipPage />} />
              <Route path="/final-submission" element={<FinalSubmissionPage />} />

              {/* Interview routes */}
              <Route path="/interviews" element={<InterviewList />} />
              <Route path="/interviews/:id" element={<InterviewDetail />} />

              {/* Recruiter routes */}
              <Route path="/my-internships" element={<RecruiterInternships />} />
              <Route path="/my-internships/new" element={<InternshipForm />} />
              <Route path="/my-internships/:id/edit" element={<InternshipForm />} />
              <Route path="/offers" element={<ManageOffersPage />} />

              {/* TPO routes */}
              <Route path="/approvals" element={<ApprovalCenterPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/completion" element={<CompletionReviewPage />} />

              {/* College Mentor routes */}
              <Route path="/my-students" element={<MyStudentsPage />} />

              {/* Company Mentor routes */}
              <Route path="/my-interns" element={<MyInternsPage />} />
              <Route path="/evaluations" element={<FinalEvaluationPage />} />

              {/* Generic placeholders */}
              <Route path="/internship-record" element={<Placeholder title="Internship Record" />} />
              <Route path="/students" element={<Placeholder title="Student Management" />} />
              <Route path="/companies" element={<Placeholder title="Company Management" />} />
              <Route path="/final-review" element={<Placeholder title="Final Review" />} />
              <Route path="/reports" element={<Placeholder title="Reports" />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
