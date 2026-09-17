import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Briefcase, ClipboardList, Video, TrendingUp, ArrowRight, Calendar } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  const stats = data?.stats || {};

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's your internship journey overview</p>
        </div>
        <Link to="/internships" className="btn btn-primary">
          <Briefcase size={16} /> Browse Internships
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Applications', value: stats.totalApplications || 0, icon: ClipboardList, color: '#4f46e5', bg: '#ede9fe' },
          { label: 'Shortlisted', value: stats.shortlisted || 0, icon: TrendingUp, color: '#0ea5e9', bg: '#e0f2fe' },
          { label: 'Interviews', value: stats.interviews || 0, icon: Video, color: '#f59e0b', bg: '#fef3c7' },
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
        {/* Recent Applications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Applications</h3>
            <Link to="/applications" style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {data?.recentApplications?.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No applications yet. <Link to="/internships" style={{ color: '#4f46e5' }}>Browse internships</Link></p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.recentApplications?.slice(0, 4).map((app) => (
                <div key={app._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                      🏢
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{app.internshipId?.title || 'Internship'}</div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{app.internshipId?.companyId?.name}</div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Upcoming Interviews</h3>
            <Link to="/interviews" style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {data?.upcomingInterviews?.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <Video size={32} style={{ color: '#cbd5e1', margin: '0 auto 8px', display: 'block' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No upcoming interviews</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.upcomingInterviews?.map((interview) => (
                <div key={interview._id} style={{ padding: '12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{interview.internshipId?.title}</div>
                    <span className="badge badge-info">{interview.roundName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.8rem' }}>
                    <Calendar size={13} />
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </div>
                  <Link to={`/interviews/${interview._id}`} className="btn btn-primary btn-sm" style={{ marginTop: 10, width: '100%' }}>
                    Join Interview
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { to: '/internships', label: '🔍 Find Internships', desc: 'Browse open roles' },
          { to: '/preparation', label: '📚 Prepare', desc: 'Interview prep hub' },
          { to: '/profile', label: '👤 Update Profile', desc: 'Keep it fresh' },
        ].map(({ to, label, desc }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card card-hover" style={{ padding: '16px 20px', cursor: 'pointer' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{label}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
