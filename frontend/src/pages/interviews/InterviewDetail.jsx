import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import { Video, Calendar, Clock, User, ArrowLeft, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    api.get(`/interviews/${id}`).then(res => {
      setInterview(res.data.data);
      setNotes(res.data.data.notes || '');
    }).catch(() => toast.error('Failed to load interview')).finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await api.post(`/interviews/${id}/join`);
      const roomData = res.data.data;
      // Navigate to workspace
      navigate(`/interviews/${id}/workspace`, { state: roomData });
    } catch (err) {
      toast.error('Failed to join interview');
    } finally {
      setJoining(false);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.patch(`/interviews/${id}/status`, { notes });
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const markComplete = async () => {
    try {
      await api.patch(`/interviews/${id}/status`, { status: 'COMPLETED', notes });
      toast.success('Interview marked as completed');
      const res = await api.get(`/interviews/${id}`);
      setInterview(res.data.data);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!interview) return <div className="empty-state"><h3>Interview not found</h3></div>;

  const isRecruiter = user.role === 'RECRUITER';
  const canJoin = ['SCHEDULED', 'IN_PROGRESS'].includes(interview.status);
  const scheduledTime = new Date(interview.scheduledAt);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Video size={24} color="#d97706" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>
                {interview.internshipId?.title}
              </h1>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {interview.internshipId?.companyId?.name} · {interview.roundName}
              </div>
            </div>
          </div>
          <StatusBadge status={interview.status} />
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '16px 0', borderTop: '1px solid #f1f5f9', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Date & Time</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} />
              {scheduledTime.toLocaleDateString()} at {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Duration</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}><Clock size={14} style={{ display: 'inline', marginRight: 4 }} />{interview.duration} minutes</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Candidate</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}><User size={14} style={{ display: 'inline', marginRight: 4 }} />{interview.studentId?.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{interview.studentId?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Interviewer</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{interview.recruiterId?.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{interview.recruiterId?.email}</div>
          </div>
        </div>

        {/* Room ID */}
        <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Room ID</div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#374151' }}>{interview.roomId}</div>
          </div>
        </div>

        {/* Join button */}
        {canJoin && (
          <button
            className="btn btn-primary btn-lg"
            onClick={handleJoin}
            disabled={joining}
            style={{ width: '100%' }}
            id="join-interview-btn"
          >
            {joining ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : (
              <><Video size={18} /> Join Interview Workspace</>
            )}
          </button>
        )}
      </div>

      {/* Interviewer notes — visible to recruiter */}
      {isRecruiter && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>📝 Interview Notes & Evaluation</h3>
          <textarea
            className="input"
            rows={5}
            placeholder="Add your notes, observations, and evaluation here..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ resize: 'vertical', fontFamily: 'inherit', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={saveNotes} disabled={savingNotes}>
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
            {interview.status !== 'COMPLETED' && (
              <button className="btn btn-ghost btn-sm" onClick={markComplete}>
                ✅ Mark Completed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Student view of notes/evaluation */}
      {!isRecruiter && interview.evaluation && (
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>Interview Feedback</h3>
          <p style={{ color: '#475569', lineHeight: 1.7 }}>{interview.evaluation}</p>
        </div>
      )}
    </div>
  );
}
