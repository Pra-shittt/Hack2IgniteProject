import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Users, Briefcase, ClipboardList, AlertTriangle } from 'lucide-react';

export default function TPODashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tpo/dashboard').then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  const stats = data?.stats || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">TPO Dashboard</h1>
          <p className="page-subtitle">Institutional internship management overview</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Students', value: stats.totalStudents || 0, icon: Users, color: '#4f46e5', bg: '#ede9fe' },
          { label: 'Total Internships', value: stats.totalInternships || 0, icon: Briefcase, color: '#0ea5e9', bg: '#e0f2fe' },
          { label: 'Open Positions', value: stats.openInternships || 0, icon: Briefcase, color: '#22c55e', bg: '#dcfce7' },
          { label: 'Total Applications', value: stats.totalApplications || 0, icon: ClipboardList, color: '#f59e0b', bg: '#fef3c7' },
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

      <div className="card">
        <h3 className="section-title">⚠️ What Needs My Attention</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 16, background: '#fef3c7', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#92400e' }}>Pending Approvals</div>
              <div style={{ color: '#b45309', fontSize: '0.8rem', marginTop: 2 }}>Review and approve pending internship offers. <a href="/approvals" style={{ color: '#4f46e5' }}>Go to Approvals →</a></div>
            </div>
          </div>
          <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 10, display: 'flex', gap: 12 }}>
            <div style={{ color: '#16a34a', fontSize: '0.875rem' }}>✅ Execution monitoring will be available in Batch 2 (weekly reports, milestones, early warnings).</div>
          </div>
        </div>
      </div>
    </div>
  );
}
