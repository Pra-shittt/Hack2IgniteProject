import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/shared/StatusBadge';
import { Users, ChevronDown, Calendar, FileText, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import ScheduleInterviewModal from './ScheduleInterviewModal';

export default function RecruiterApplications() {
  const [searchParams] = useSearchParams();
  const internshipId = searchParams.get('internshipId');
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(internshipId || '');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(null); // application to schedule for

  useEffect(() => {
    api.get('/internships').then(res => setInternships(res.data.data));
  }, []);

  useEffect(() => {
    if (selectedInternship) fetchApplications();
  }, [selectedInternship]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/internships/${selectedInternship}/applications`);
      setApplications(data.data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, status, remarks) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status, recruiterRemarks: remarks });
      toast.success(`Status updated to ${status}`);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">Review and manage candidate applications</p>
        </div>
      </div>

      {/* Internship selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, color: '#374151' }}>Select Internship</label>
        <select
          className="input"
          value={selectedInternship}
          onChange={e => setSelectedInternship(e.target.value)}
          style={{ maxWidth: 400 }}
        >
          <option value="">-- Select an internship --</option>
          {internships.map(i => <option key={i._id} value={i._id}>{i.title}</option>)}
        </select>
      </div>

      {!selectedInternship ? (
        <div className="empty-state card">
          <Users size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px', display: 'block' }} />
          <h3>Select an internship to view applications</h3>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : applications.length === 0 ? (
        <div className="empty-state card"><h3>No applications yet for this internship</h3></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Skills</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{app.studentId?.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{app.studentId?.email}</div>
                    {app.studentProfile?.cgpa && <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>CGPA: {app.studentProfile.cgpa}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {app.studentProfile?.skills?.slice(0, 3).map(s => (
                        <span key={s} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" title="View Resume">
                          <FileText size={14} />
                        </a>
                      )}
                      {app.status === 'APPLIED' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(app._id, 'SHORTLISTED')}>Shortlist</button>
                      )}
                      {app.status === 'SHORTLISTED' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setScheduleModal(app)}>
                          <Video size={14} /> Schedule Interview
                        </button>
                      )}
                      {app.status === 'INTERVIEW' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(app._id, 'SELECTED')}>Select</button>
                      )}
                      {!['REJECTED', 'OFFERED'].includes(app.status) && (
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(app._id, 'REJECTED')}>Reject</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {scheduleModal && (
        <ScheduleInterviewModal
          application={scheduleModal}
          onClose={() => setScheduleModal(null)}
          onScheduled={() => { setScheduleModal(null); fetchApplications(); }}
        />
      )}
    </div>
  );
}
