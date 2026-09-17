import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Briefcase, ClipboardList, Video, Users, Plus, ArrowRight, Calendar } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/recruiter/dashboard')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  const stats = data?.stats || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Recruiter Dashboard</h1>
          <p className="page-subtitle">Manage your internship openings and candidates</p>
        </div>
        <Link to="/my-internships/new" className="btn btn-primary">
          <Plus size={16} /> Post Internship
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Open Internships', value: stats.openInternships || 0, icon: Briefcase, color: '#4f46e5', bg: '#ede9fe' },
          { label: 'Total Applications', value: stats.totalApplications || 0, icon: ClipboardList, color: '#0ea5e9', bg: '#e0f2fe' },
          { label: 'Shortlisted', value: stats.shortlisted || 0, icon: Users, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Interviews', value: stats.interviews || 0, icon: Video, color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Selected', value: stats.selected || 0, icon: Briefcase, color: '#22c55e', bg: '#dcfce7' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Upcoming Interviews */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Upcoming Interviews</h3>
            <Link to="/interviews" style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View all <ArrowRight size={14} style={{ display: 'inline' }} /></Link>
          </div>
          {!data?.upcomingInterviews?.length ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No upcoming interviews</p>
            </div>
          ) : data.upcomingInterviews.map(iv => (
            <div key={iv._id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{iv.studentId?.name}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', display: 'flex', gap: 8, marginTop: 2, alignItems: 'center' }}>
                <Calendar size={12} />{new Date(iv.scheduledAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* My Internships */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>My Internships</h3>
            <Link to="/my-internships" style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View all <ArrowRight size={14} style={{ display: 'inline' }} /></Link>
          </div>
          {!data?.recentInternships?.length ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No internships yet. <Link to="/my-internships/new" style={{ color: '#4f46e5' }}>Post one</Link></p>
            </div>
          ) : data.recentInternships.slice(0, 5).map(i => (
            <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{i.title}</div>
              <StatusBadge status={i.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
