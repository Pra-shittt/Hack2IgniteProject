import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import { Plus, Briefcase, MapPin, DollarSign, Clock, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecruiterInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/internships').then(res => setInternships(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Internships</h1>
          <p className="page-subtitle">{internships.length} posted internship{internships.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/my-internships/new" className="btn btn-primary">
          <Plus size={16} /> Post Internship
        </Link>
      </div>

      {internships.length === 0 ? (
        <div className="empty-state card">
          <Briefcase size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
          <h3>No internships posted yet</h3>
          <Link to="/my-internships/new" className="btn btn-primary" style={{ marginTop: 16 }}>Post Your First Internship</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {internships.map(i => (
            <div key={i._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{i.title}</h3>
                  <StatusBadge status={i.status} />
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {i.location && <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} />{i.location}</span>}
                  {i.stipend && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>₹{i.stipend.toLocaleString()}/mo</span>}
                  {i.duration && <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={12} />{i.duration}</span>}
                  {i.applicationDeadline && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📅 {new Date(i.applicationDeadline).toLocaleDateString()}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/applications?internshipId=${i._id}`} className="btn btn-secondary btn-sm">View Applications</Link>
                <Link to={`/my-internships/${i._id}/edit`} className="btn btn-ghost btn-sm"><Edit size={14} /> Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
