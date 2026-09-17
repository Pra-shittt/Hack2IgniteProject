import { useAuth } from '../../context/AuthContext';

export default function CollegeMentorDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">College Mentor Dashboard</h1>
          <p className="page-subtitle">Monitor your assigned students' internship progress</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <h3>Students will appear here once assigned by TPO</h3>
          <p style={{ color: '#94a3b8', marginTop: 8 }}>
            The TPO admin will assign students to you. Once assigned, you can monitor their progress, review reports, and provide recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
