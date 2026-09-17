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

// Interview pages
import InterviewList from './pages/interviews/InterviewList';
import InterviewDetail from './pages/interviews/InterviewDetail';
import InterviewWorkspace from './pages/interviews/InterviewWorkspace';

// Recruiter pages
import RecruiterInternships from './pages/recruiter/RecruiterInternships';
import InternshipForm from './pages/recruiter/InternshipForm';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';

// Placeholder for Batch 2 pages
const Placeholder = ({ title }) => (
  <div className="card" style={{ textAlign: 'center', padding: 60 }}>
    <h2 style={{ color: '#64748b', fontSize: '1.2rem' }}>{title}</h2>
    <p style={{ color: '#94a3b8', marginTop: 8 }}>This feature will be available in the next batch.</p>
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

              {/* Interview routes (shared student + recruiter) */}
              <Route path="/interviews" element={<InterviewList />} />
              <Route path="/interviews/:id" element={<InterviewDetail />} />

              {/* Recruiter routes */}
              <Route path="/my-internships" element={<RecruiterInternships />} />
              <Route path="/my-internships/new" element={<InternshipForm />} />
              <Route path="/my-internships/:id/edit" element={<InternshipForm />} />

              {/* Batch 2 placeholder routes */}
              <Route path="/my-internship" element={<Placeholder title="My Internship — Coming in Batch 2" />} />
              <Route path="/final-submission" element={<Placeholder title="Final Submission — Coming in Batch 2" />} />
              <Route path="/internship-record" element={<Placeholder title="Internship Record — Coming in Batch 2" />} />
              <Route path="/approvals" element={<Placeholder title="Approvals / NOC — Coming in Batch 2" />} />
              <Route path="/monitoring" element={<Placeholder title="Internship Monitoring — Coming in Batch 2" />} />
              <Route path="/completion" element={<Placeholder title="Completion Review — Coming in Batch 2" />} />
              <Route path="/students" element={<Placeholder title="Student Management — Coming in Batch 2" />} />
              <Route path="/companies" element={<Placeholder title="Company Management" />} />
              <Route path="/my-students" element={<Placeholder title="My Students — Coming in Batch 2" />} />
              <Route path="/final-review" element={<Placeholder title="Final Review — Coming in Batch 2" />} />
              <Route path="/my-interns" element={<Placeholder title="My Interns — Coming in Batch 2" />} />
              <Route path="/reports" element={<Placeholder title="Reports — Coming in Batch 2" />} />
              <Route path="/evaluations" element={<Placeholder title="Evaluations — Coming in Batch 2" />} />
              <Route path="/offers" element={<Placeholder title="Offers — Coming in Batch 2" />} />
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
