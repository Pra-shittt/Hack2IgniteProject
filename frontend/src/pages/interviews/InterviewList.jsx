import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import { Video, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function InterviewList() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interviews/my').then(res => setInterviews(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Interviews</h1>
          <p className="page-subtitle">{interviews.length} interview{interviews.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="empty-state card">
          <Video size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
          <h3>No interviews scheduled</h3>
          <p style={{ color: '#94a3b8' }}>Interviews will appear here once a recruiter schedules them.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {interviews.map(iv => (
            <div key={iv._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={20} color="#d97706" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>
                    {iv.internshipId?.title} — {iv.roundName}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {iv.internshipId?.companyId?.name}
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#475569' }}>
                      <Calendar size={13} /> {new Date(iv.scheduledAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#475569' }}>
                      <Clock size={13} /> {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>⏱ {iv.duration} min</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <StatusBadge status={iv.status} />
                <Link to={`/interviews/${iv._id}`} className="btn btn-primary btn-sm">
                  View Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
