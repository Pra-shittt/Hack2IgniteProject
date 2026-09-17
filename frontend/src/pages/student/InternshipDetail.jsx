import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, DollarSign, Calendar, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';

export default function InternshipDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [application, setApplication] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    api.get(`/internships/${id}`)
      .then(res => {
        setInternship(res.data.data);
        setApplication(res.data.application);
        setEligibility(res.data.eligibilityResult);
      })
      .catch(() => toast.error('Failed to load internship'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!profile?.resumeUrl) {
      toast.error('Please upload your resume in Profile before applying');
      return;
    }
    setApplying(true);
    try {
      await api.post('/applications', { internshipId: id, coverLetter });
      toast.success('Application submitted!');
      const res = await api.get(`/internships/${id}`);
      setApplication(res.data.application);
      setShowCover(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!internship) return <div className="empty-state"><h3>Internship not found</h3></div>;

  const company = internship.companyId;
  const eli = internship.eligibility;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            {company?.logoUrl ? <img src={company.logoUrl} style={{ width: '100%', height: '100%', borderRadius: 12, objectFit: 'cover' }} /> : '🏢'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{internship.title}</h1>
                <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem' }}>{company?.name}</div>
              </div>
              <StatusBadge status={internship.status} />
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 20, padding: '16px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          {[
            internship.location && { icon: MapPin, label: internship.location },
            internship.stipend && { icon: DollarSign, label: `₹${internship.stipend.toLocaleString()}/month` },
            internship.duration && { icon: Clock, label: internship.duration },
            internship.applicationDeadline && { icon: Calendar, label: `Deadline: ${new Date(internship.applicationDeadline).toLocaleDateString()}` },
          ].filter(Boolean).map(({ icon: Icon, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: '#475569' }}>
              <Icon size={14} color="#94a3b8" /> {label}
            </span>
          ))}
        </div>

        {/* Eligibility */}
        {eligibility && user.role === 'STUDENT' && (
          <div style={{ padding: 14, borderRadius: 10, marginBottom: 16, background: eligibility.eligible ? '#f0fdf4' : '#fff7ed', border: `1px solid ${eligibility.eligible ? '#bbf7d0' : '#fed7aa'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: eligibility.reasons?.length ? 8 : 0 }}>
              {eligibility.eligible ? <CheckCircle size={16} color="#16a34a" /> : <XCircle size={16} color="#ea580c" />}
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: eligibility.eligible ? '#15803d' : '#c2410c' }}>
                {eligibility.eligible ? 'You meet the eligibility criteria' : 'You may not meet all criteria'}
              </span>
            </div>
            {eligibility.reasons?.map(r => (
              <div key={r} style={{ color: '#c2410c', fontSize: '0.8rem', marginLeft: 24 }}>• {r}</div>
            ))}
          </div>
        )}

        {/* Apply section */}
        {user.role === 'STUDENT' && (
          <div>
            {application ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                <CheckCircle size={18} color="#22c55e" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Applied — </span>
                <StatusBadge status={application.status} />
              </div>
            ) : (
              <div>
                {!showCover ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCover(true)}
                    disabled={internship.status !== 'OPEN'}
                  >
                    {internship.status === 'OPEN' ? '🚀 Apply Now' : 'Applications Closed'}
                  </button>
                ) : (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>Cover Letter (optional)</label>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="Why are you interested in this internship?"
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
                        {applying ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Submit Application'}
                      </button>
                      <button className="btn btn-ghost" onClick={() => setShowCover(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>About This Internship</h2>
        <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{internship.description}</p>
      </div>

      {/* Skills */}
      {internship.skills?.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Skills Required</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {internship.skills.map(s => <span key={s} className="badge badge-indigo">{s}</span>)}
          </div>
        </div>
      )}

      {/* Eligibility details */}
      {eli && (eli.minCgpa || eli.allowedBranches?.length || eli.allowedYears?.length || eli.description) && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Eligibility Criteria</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {eli.minCgpa && <div style={{ fontSize: '0.875rem', color: '#475569' }}>📊 Minimum CGPA: <strong>{eli.minCgpa}</strong></div>}
            {eli.allowedBranches?.length > 0 && <div style={{ fontSize: '0.875rem', color: '#475569' }}>🎓 Branches: <strong>{eli.allowedBranches.join(', ')}</strong></div>}
            {eli.allowedYears?.length > 0 && <div style={{ fontSize: '0.875rem', color: '#475569' }}>📅 Years: <strong>{eli.allowedYears.join(', ')}</strong></div>}
            {eli.description && <div style={{ fontSize: '0.875rem', color: '#475569' }}>{eli.description}</div>}
          </div>
        </div>
      )}

      {/* Preparation Hub */}
      {(internship.technicalQuestions?.length > 0 || internship.hrQuestions?.length > 0 || internship.preparationTips?.length > 0) && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>📚 Preparation Hub</h2>
          {internship.preparationTips?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: 8 }}>Tips</h3>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {internship.preparationTips.map((t, i) => <li key={i} style={{ color: '#475569', fontSize: '0.875rem' }}>{t}</li>)}
              </ul>
            </div>
          )}
          {internship.technicalQuestions?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: 8 }}>Technical Questions</h3>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {internship.technicalQuestions.map((q, i) => <li key={i} style={{ color: '#475569', fontSize: '0.875rem' }}>{q}</li>)}
              </ol>
            </div>
          )}
          {internship.hrQuestions?.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: 8 }}>HR Questions</h3>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {internship.hrQuestions.map((q, i) => <li key={i} style={{ color: '#475569', fontSize: '0.875rem' }}>{q}</li>)}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Company info */}
      {company && (
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>About {company.name}</h2>
          {company.description && <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 12 }}>{company.description}</p>}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {company.industry && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>🏭 {company.industry}</span>}
            {company.location && <span style={{ fontSize: '0.8rem', color: '#64748b' }}><MapPin size={12} style={{ display: 'inline' }} /> {company.location}</span>}
            {company.website && <a href={company.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#4f46e5' }}>🌐 Website</a>}
          </div>
        </div>
      )}
    </div>
  );
}
