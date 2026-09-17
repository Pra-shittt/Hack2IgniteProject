import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Users, Briefcase, ClipboardList, AlertTriangle } from 'lucide-react';

export default function TPODashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tpo/dashboard').catch(() => ({ data: { data: null } })),
      api.get('/monitoring').catch(() => ({ data: { data: [], summary: null } })),
      api.get('/approvals?status=PENDING').catch(() => ({ data: { data: [] } })),
    ]).then(([dashRes, monRes, appRes]) => {
      setData(dashRes.data.data);
      setMonitoring({ summary: monRes.data.summary, records: monRes.data.data || [] });
      setPendingApprovals((appRes.data.data || []).length);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  const stats = data?.stats || {};
  const summary = monitoring?.summary || {};
  const atRiskStudents = (monitoring?.records || []).filter(r => r.warningStatus === 'AT_RISK');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">TPO Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Institutional internship management overview.</p>
        </div>
      </div>

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: stats.totalStudents || 0, icon: Users, color: '#4f46e5', bg: '#ede9fe' },
          { label: 'Total Internships', value: stats.totalInternships || 0, icon: Briefcase, color: '#0ea5e9', bg: '#e0f2fe' },
          { label: 'Active Internships', value: summary.total || 0, icon: Briefcase, color: '#22c55e', bg: '#dcfce7' },
          { label: 'Total Applications', value: stats.totalApplications || 0, icon: ClipboardList, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Pending Approvals', value: pendingApprovals, icon: AlertTriangle, color: '#ef4444', bg: '#fee2e2' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
            <div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Early Warning Summary */}
      {summary.total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'On Track', value: summary.onTrack || 0, color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
            { label: 'Needs Attention', value: summary.needsAttention || 0, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'At Risk', value: summary.atRisk || 0, color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
          ].map(s => (
            <Link key={s.label} to="/monitoring" style={{ textDecoration: 'none' }}>
              <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '16px 20px', cursor: 'pointer' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: s.color, fontWeight: 500 }}>{s.label}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Needs Attention */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>🚨 At-Risk Students</h3>
            <Link to="/monitoring" style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 500 }}>View All →</Link>
          </div>
          {atRiskStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
              <p style={{ color: '#22c55e', fontWeight: 500 }}>All students are on track!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {atRiskStudents.slice(0, 4).map(r => (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #fee2e2' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#dc2626', fontSize: '0.8rem', flexShrink: 0 }}>
                    {r.studentId?.name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, margin: 0, fontSize: '0.8rem' }}>{r.studentId?.name}</p>
                    <p style={{ color: '#64748b', fontSize: '0.7rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.internshipId?.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="section-title">Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '📋 Review Pending Approvals', to: '/approvals', urgent: pendingApprovals > 0 },
              { label: '📡 Internship Monitoring', to: '/monitoring' },
              { label: '🏆 Completion Reviews', to: '/completion' },
              { label: '🎓 Manage Students', to: '/students' },
            ].map(a => (
              <Link key={a.to} to={a.to}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                  background: a.urgent ? '#fef2f2' : '#f8fafc',
                  border: `1px solid ${a.urgent ? '#fca5a5' : '#e2e8f0'}`,
                  color: a.urgent ? '#dc2626' : '#374151', fontWeight: 500, fontSize: '0.875rem',
                  transition: 'background 0.2s',
                }}>
                {a.label}
                {a.urgent && <span style={{ background: '#dc2626', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{pendingApprovals}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
