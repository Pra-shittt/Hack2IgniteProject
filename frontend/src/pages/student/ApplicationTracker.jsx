import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import { ClipboardList, MapPin, Calendar, ArrowRight } from 'lucide-react';

const STATUS_ORDER = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'OFFERED'];

function WorkflowTracker({ status }) {
  const current = STATUS_ORDER.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 12 }}>
      {STATUS_ORDER.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const isRejected = status === 'REJECTED';
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_ORDER.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flex: 'none', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                background: isRejected && active ? '#fee2e2' : done ? '#4f46e5' : active ? '#4f46e5' : '#e2e8f0',
                color: done || active ? 'white' : '#94a3b8',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: '0.62rem', color: done || active ? '#4f46e5' : '#94a3b8', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap', textAlign: 'center' }}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </div>
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#4f46e5' : '#e2e8f0', margin: '0 4px', marginBottom: 16 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/my').then(res => setApplications(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">{applications.length} total applications</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state card">
          <ClipboardList size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px', display: 'block' }} />
          <h3>No applications yet</h3>
          <p>Start browsing internships and apply to kickstart your journey.</p>
          <Link to="/internships" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Internships</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {applications.map((app) => {
            const internship = app.internshipId;
            const company = internship?.companyId;
            return (
              <div key={app._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {company?.logoUrl ? <img src={company.logoUrl} style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }} /> : '🏢'}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{internship?.title}</h3>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#4f46e5' }}>{company?.name}</span>
                        {internship?.location && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{internship.location}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={11} />Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StatusBadge status={app.status} />
                    <Link to={`/internships/${internship?._id}`} className="btn btn-ghost btn-sm">
                      View <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Workflow tracker */}
                {app.status !== 'REJECTED' && <WorkflowTracker status={app.status} />}

                {/* Recruiter remarks */}
                {app.recruiterRemarks && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #4f46e5' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: 2 }}>Recruiter Note</div>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}>{app.recruiterRemarks}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
