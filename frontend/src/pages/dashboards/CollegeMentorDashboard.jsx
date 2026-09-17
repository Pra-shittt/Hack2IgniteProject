import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CollegeMentorDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/internship-records?status=ACTIVE')
      .then(res => setRecords(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const warningCounts = {
    ON_TRACK: records.filter(r => r.warningStatus === 'ON_TRACK').length,
    NEEDS_ATTENTION: records.filter(r => r.warningStatus === 'NEEDS_ATTENTION').length,
    AT_RISK: records.filter(r => r.warningStatus === 'AT_RISK').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">College Mentor Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Monitor your students' internship progress.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Students', value: records.length, color: '#4f46e5', bg: '#ede9fe', icon: '👤' },
          { label: 'On Track', value: warningCounts.ON_TRACK, color: '#16a34a', bg: '#dcfce7', icon: '✅' },
          { label: 'Needs Attention', value: warningCounts.NEEDS_ATTENTION, color: '#d97706', bg: '#fef3c7', icon: '⚠️' },
          { label: 'At Risk', value: warningCounts.AT_RISK, color: '#dc2626', bg: '#fee2e2', icon: '🚨' },
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

      {/* Recent Students */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>My Students</h3>
          <Link to="/my-students" style={{ color: '#4f46e5', fontSize: '0.875rem', fontWeight: 500 }}>View All →</Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <h3>No students assigned yet</h3>
            <p style={{ color: '#94a3b8', marginTop: 8 }}>The TPO will assign students to you once internships are activated.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {records.slice(0, 5).map(r => (
              <Link key={r._id} to="/my-students"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#4f46e5', flexShrink: 0 }}>
                  {r.studentId?.name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, margin: 0, fontSize: '0.875rem' }}>{r.studentId?.name}</p>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.internshipId?.title} • {r.companyId?.name}</p>
                </div>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, fontWeight: 500,
                  background: r.warningStatus === 'AT_RISK' ? '#fee2e2' : r.warningStatus === 'NEEDS_ATTENTION' ? '#fef3c7' : '#dcfce7',
                  color: r.warningStatus === 'AT_RISK' ? '#dc2626' : r.warningStatus === 'NEEDS_ATTENTION' ? '#d97706' : '#16a34a',
                }}>
                  {(r.warningStatus || 'ON_TRACK').replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="section-title">Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/my-students" className="btn btn-primary" style={{ textDecoration: 'none' }}>👤 View My Students</Link>
        </div>
      </div>
    </div>
  );
}
