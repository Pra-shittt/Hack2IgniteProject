import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { X, Video } from 'lucide-react';

const ROUND_NAMES = ['Technical Round', 'HR Round', 'Managerial Round', 'Group Discussion', 'Final Round'];

export default function ScheduleInterviewModal({ application, onClose, onScheduled }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { round: 1, roundName: 'Technical Round', duration: 60 }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/interviews', {
        applicationId: application._id,
        round: Number(data.round),
        roundName: data.roundName,
        scheduledAt: data.scheduledAt,
        duration: Number(data.duration),
      });
      toast.success('Interview scheduled successfully!');
      onScheduled();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={18} color="#d97706" />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Schedule Interview</h2>
              <p style={{ color: '#64748b', fontSize: '0.78rem' }}>{application.studentId?.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Round Number</label>
              <input className="input" type="number" min="1" max="10" {...register('round', { required: true })} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Round Type</label>
              <select className="input" {...register('roundName')}>
                {ROUND_NAMES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Date & Time *</label>
            <input
              className={`input ${errors.scheduledAt ? 'input-error' : ''}`}
              type="datetime-local"
              {...register('scheduledAt', { required: 'Date and time required' })}
            />
            {errors.scheduledAt && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{errors.scheduledAt.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Duration (minutes)</label>
            <input className="input" type="number" min="15" max="180" step="15" {...register('duration')} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Schedule Interview'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
