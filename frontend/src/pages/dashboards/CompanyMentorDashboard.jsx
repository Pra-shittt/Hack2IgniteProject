import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CompanyMentorDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/internship-records?status=ACTIVE').catch(() => ({ data: { data: [] } })),
      api.get('/weekly-reports?status=SUBMITTED').catch(() => ({ data: { data: [] } })),
    ]).then(([recRes, rpRes]) => {
      setRecords(recRes.data.data || []);
      setPendingReports(rpRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Mentor Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Supervise your interns and review their reports.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Active Interns', value: records.length, color: '#4f46e5', bg: '#ede9fe', icon: '👷' },
          { label: 'Pending Reviews', value: pendingReports.length, color: '#d97706', bg: '#fef3c7', icon: '📝' },
        ].map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.bg, fontSize: '1.2rem' }}>{card.icon}</div>
            <div>
              <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Reports */}
      {pendingReports.length > 0 && (
        <div className="card" style={{ marginBottom: 16, background: '#fffbeb', borderColor: '#fde68a' }}>
          <h3 className="section-title">⏳ Reports Waiting for Review ({pendingReports.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingReports.slice(0, 3).map(r => (
              <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #fde68a' }}>
                <div>
                  <p style={{ fontWeight: 500, margin: 0, fontSize: '0.875rem' }}>{r.studentId?.name}</p>
                  <p style={{ color: '#92400e', fontSize: '0.75rem', margin: 0 }}>Week {r.weekNumber} Report</p>
                </div>
                <Link to="/my-interns" style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 500 }}>Review →</Link>
              </div>
            ))}
          </div>
          {pendingReports.length > 3 && (
            <Link to="/my-interns" style={{ color: '#4f46e5', fontSize: '0.8rem', display: 'block', marginTop: 8 }}>
              + {pendingReports.length - 3} more pending…
            </Link>
          )}
        </div>
      )}

      {/* Active Interns */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>Active Interns</h3>
          <Link to="/my-interns" style={{ color: '#4f46e5', fontSize: '0.875rem', fontWeight: 500 }}>View All →</Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <h3>No interns assigned yet</h3>
            <p style={{ color: '#94a3b8', marginTop: 8 }}>Once students are onboarded with you as mentor, they'll appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {records.slice(0, 5).map(r => (
              <Link key={r._id} to="/my-interns"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#1d4ed8', flexShrink: 0 }}>
                  {r.studentId?.name?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, margin: 0, fontSize: '0.875rem' }}>{r.studentId?.name}</p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>{r.internshipId?.title}</p>
                </div>
                <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                  <div style={{ height: 6, background: '#4f46e5', borderRadius: 3, width: `${r.progressPercent || 0}%` }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.progressPercent || 0}%</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/my-interns" className="btn btn-primary" style={{ textDecoration: 'none' }}>👷 Manage Interns</Link>
          <Link to="/evaluations" className="btn btn-secondary" style={{ textDecoration: 'none' }}>📊 Evaluations</Link>
        </div>
      </div>
    </div>
  );
}
