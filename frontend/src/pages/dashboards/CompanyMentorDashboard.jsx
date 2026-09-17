import { useAuth } from '../../context/AuthContext';

export default function CompanyMentorDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Mentor Dashboard</h1>
          <p className="page-subtitle">Supervise and evaluate your assigned interns</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <h3>Interns will appear here once assigned</h3>
          <p style={{ color: '#94a3b8', marginTop: 8 }}>
            Once students are onboarded, you can define internship plans, review weekly reports, and provide evaluations.
          </p>
        </div>
      </div>
    </div>
  );
}
