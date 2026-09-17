import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Smart dashboard redirect based on user role
export default function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  const dashboards = {
    STUDENT: '/student-dashboard',
    TPO_ADMIN: '/tpo-dashboard',
    COLLEGE_MENTOR: '/mentor-dashboard',
    RECRUITER: '/recruiter-dashboard',
    COMPANY_MENTOR: '/company-mentor-dashboard',
  };

  return <Navigate to={dashboards[user.role] || '/login'} replace />;
}
