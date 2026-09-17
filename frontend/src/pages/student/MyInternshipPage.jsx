import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function MyInternshipPage() {
  const [record, setRecord] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [reports, setReports] = useState([]);
  const [offer, setOffer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    weekNumber: '', workSummary: '', skillsUsed: '', learningOutcomes: '',
    challenges: '', achievements: '', nextWeekGoals: '', attendanceDays: 5, progressPercent: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiWarning, setAiWarning] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordRes, offerRes] = await Promise.all([
        api.get('/internship-records/my').catch(() => ({ data: { data: null } })),
        api.get('/offers/my').catch(() => ({ data: { data: null } })),
      ]);
      setRecord(recordRes.data.data);
      setOffer(offerRes.data.data);
      if (recordRes.data.data) {
        const [msRes, rpRes] = await Promise.all([
          api.get(`/internship-records/${recordRes.data.data._id}/milestones`),
          api.get(`/weekly-reports?internshipRecordId=${recordRes.data.data._id}`),
        ]);
        setMilestones(msRes.data.data || []);
        setReports(rpRes.data.data || []);
        setReportForm(f => ({ ...f, weekNumber: (rpRes.data.data?.length || 0) + 1 }));
      }
    } finally { setLoading(false); }
  };

  const handleRespondOffer = async (status) => {
    await api.patch(`/offers/${offer._id}/respond`, { status });
    fetchData();
  };

  const handleSubmitReport = async (asDraft = false) => {
    try {
      setSubmitting(true);
      setAiWarning(null);
      const payload = {
        ...reportForm,
        internshipRecordId: record._id,
        skillsUsed: reportForm.skillsUsed.split(',').map(s => s.trim()).filter(Boolean),
      };
      const endpoint = asDraft ? '/weekly-reports/draft' : '/weekly-reports';
      const res = await api.post(endpoint, payload);
      if (res.data.confidentialityWarning) setAiWarning(res.data.confidentialityWarning);
      setShowReportForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report');
    } finally { setSubmitting(false); }
  };

  const overallProgress = milestones.length > 0
    ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length) : 0;

  const statusBadge = (status) => {
    const m = {
      DRAFT: { bg: '#f1f5f9', color: '#475569' },
      SUBMITTED: { bg: '#dbeafe', color: '#2563eb' },
      REVISION_REQUIRED: { bg: '#fef3c7', color: '#d97706' },
      VERIFIED: { bg: '#dcfce7', color: '#16a34a' },
    };
    return m[status] || { bg: '#f1f5f9', color: '#475569' };
  };

  const riskBadge = (level) => {
    const m = {
      LOW: { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
      MEDIUM: { bg: '#ffedd5', color: '#ea580c', border: '#fed7aa' },
      HIGH: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' },
    };
    return m[level] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
      <div className="spinner" />
    </div>
  );

  // No active internship
  if (!record) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>My Internship</h1>
        {offer ? (
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, background: '#e0e7ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎉</div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>You have an offer!</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Review and respond to your internship offer</p>
              </div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              {[
                ['Role', offer.internshipId?.title],
                ['Company', offer.companyId?.name],
                ['Stipend', `₹${offer.stipend?.toLocaleString()}/month`],
                ['Duration', offer.duration],
                ['Location', offer.location || 'Remote'],
                ...(offer.joiningDate ? [['Joining Date', new Date(offer.joiningDate).toLocaleDateString()]] : []),
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{value}</span>
                </div>
              ))}
            </div>
            {offer.additionalNote && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 12, marginBottom: 24, fontSize: '0.85rem', color: '#1e40af' }}>
                <strong>Note from recruiter:</strong> {offer.additionalNote}
              </div>
            )}
            {offer.status === 'PENDING' ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => handleRespondOffer('ACCEPTED')} className="btn btn-primary" style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: '#16a34a' }}>
                  ✓ Accept Offer
                </button>
                <button onClick={() => handleRespondOffer('DECLINED')} className="btn btn-secondary" style={{ flex: 1, padding: '12px 0', borderRadius: 12, borderColor: '#fca5a5', color: '#dc2626' }}>
                  ✕ Decline
                </button>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: 12, borderRadius: 12, fontWeight: 500,
                background: offer.status === 'ACCEPTED' ? '#dcfce7' : '#fee2e2',
                color: offer.status === 'ACCEPTED' ? '#16a34a' : '#dc2626',
              }}>
                Offer {offer.status === 'ACCEPTED' ? 'Accepted ✓' : 'Declined'}
                {offer.status === 'ACCEPTED' && <p style={{ fontSize: '0.8rem', fontWeight: 400, marginTop: 4 }}>Awaiting college TPO approval…</p>}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎓</div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>No Active Internship</h2>
            <p style={{ color: '#64748b' }}>Apply to internships to get started. Your offer will appear here once a recruiter selects you.</p>
          </div>
        )}
      </div>
    );
  }

  const tabs = ['overview', 'milestones', 'reports'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 16, padding: 24, color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4, wordBreak: 'break-word' }}>{record.internshipId?.title}</h1>
            <p style={{ color: '#c7d2fe', fontSize: '0.9rem' }}>{record.companyId?.name} • {record.internshipId?.location || 'Remote'}</p>
          </div>
          <span style={{
            padding: '4px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 500, flexShrink: 0,
            background: record.status === 'ACTIVE' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.2)',
            color: record.status === 'ACTIVE' ? '#bbf7d0' : 'white',
            border: record.status === 'ACTIVE' ? '1px solid rgba(74,222,128,0.3)' : 'none',
          }}>
            {record.status}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
          <div><p style={{ color: '#c7d2fe', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Started</p><p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(record.startDate).toLocaleDateString()}</p></div>
          <div><p style={{ color: '#c7d2fe', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ends</p><p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(record.endDate).toLocaleDateString()}</p></div>
          <div><p style={{ color: '#c7d2fe', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</p><p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{overallProgress}%</p></div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, height: 8, marginTop: 12 }}>
          <div style={{ background: 'white', borderRadius: 999, height: 8, transition: 'width 0.3s', width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* AI Warning */}
      {aiWarning && aiWarning.riskLevel !== 'SAFE' && (() => {
        const rb = riskBadge(aiWarning.riskLevel);
        return (
          <div style={{ border: `1px solid ${rb.border}`, borderRadius: 12, padding: 16, background: rb.bg, color: rb.color }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>⚠️ AI Confidentiality Warning — Risk Level: {aiWarning.riskLevel}</div>
            {aiWarning.flaggedCategories?.length > 0 && <p style={{ fontSize: '0.85rem', marginBottom: 4 }}><strong>Flagged:</strong> {aiWarning.flaggedCategories.join(', ')}</p>}
            {aiWarning.suggestion && <p style={{ fontSize: '0.85rem' }}>{aiWarning.suggestion}</p>}
            <button onClick={() => setAiWarning(null)} style={{ fontSize: '0.75rem', textDecoration: 'underline', marginTop: 8, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Dismiss</button>
          </div>
        );
      })()}

      {/* Tabs */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex: 1, padding: '12px 0', fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize',
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              borderBottom: activeTab === t ? '2px solid #4f46e5' : '2px solid transparent',
              color: activeTab === t ? '#4f46e5' : '#64748b',
              transition: 'all 0.15s',
            }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {/* Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>College Mentor</p>
                  <p style={{ fontWeight: 500, wordBreak: 'break-word' }}>{record.collegeMentorId?.name || 'Not assigned'}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>{record.collegeMentorId?.email || ''}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Company Mentor</p>
                  <p style={{ fontWeight: 500, wordBreak: 'break-word' }}>{record.companyMentorId?.name || 'Not assigned'}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', wordBreak: 'break-all' }}>{record.companyMentorId?.email || ''}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { value: reports.length, label: 'Reports Submitted', bg: '#eff6ff', color: '#2563eb' },
                  { value: reports.filter(r => r.status === 'VERIFIED').length, label: 'Verified', bg: '#f0fdf4', color: '#16a34a' },
                  { value: `${milestones.filter(m => m.status === 'COMPLETED').length}/${milestones.length}`, label: 'Milestones Done', bg: '#faf5ff', color: '#7c3aed' },
                ].map(c => (
                  <div key={c.label} style={{ textAlign: 'center', background: c.bg, borderRadius: 12, padding: 16 }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: c.color }}>{c.value}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>{c.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {activeTab === 'milestones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {milestones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎯</div>
                  <p>No milestones set yet. Your company mentor will add them.</p>
                </div>
              ) : milestones.map(m => {
                const msColor = m.status === 'COMPLETED' ? { bg: '#dcfce7', color: '#16a34a' }
                  : m.status === 'IN_PROGRESS' ? { bg: '#dbeafe', color: '#2563eb' }
                  : { bg: '#f1f5f9', color: '#475569' };
                return (
                  <div key={m._id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontWeight: 500, color: '#0f172a', wordBreak: 'break-word' }}>{m.title}</h3>
                        {m.description && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4, wordBreak: 'break-word' }}>{m.description}</p>}
                      </div>
                      <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 999, fontWeight: 500, background: msColor.bg, color: msColor.color, flexShrink: 0 }}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 999, height: 8, marginTop: 12 }}>
                      <div style={{ background: '#6366f1', borderRadius: 999, height: 8, transition: 'width 0.3s', width: `${m.progress}%` }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                      {m.progress}% complete{m.dueDate ? ` • Due ${new Date(m.dueDate).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 600, color: '#0f172a' }}>Weekly Reports</h3>
                <button onClick={() => setShowReportForm(true)} className="btn btn-primary btn-sm">+ New Report</button>
              </div>

              {showReportForm && (
                <div style={{ border: '2px solid #c7d2fe', borderRadius: 12, padding: 20, background: '#eef2ff' }}>
                  <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Week {reportForm.weekNumber} Report</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>Work Summary *</label>
                      <textarea rows={3} value={reportForm.workSummary}
                        onChange={e => setReportForm(f => ({ ...f, workSummary: e.target.value }))}
                        className="input" style={{ resize: 'none', fontFamily: 'inherit' }}
                        placeholder="What did you work on this week?" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>Skills Used</label>
                        <input className="input" value={reportForm.skillsUsed}
                          onChange={e => setReportForm(f => ({ ...f, skillsUsed: e.target.value }))}
                          placeholder="React, Python (comma separated)" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>Attendance (days)</label>
                        <input type="number" min={0} max={7} className="input" value={reportForm.attendanceDays}
                          onChange={e => setReportForm(f => ({ ...f, attendanceDays: +e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>Learning Outcomes</label>
                      <textarea rows={2} className="input" style={{ resize: 'none', fontFamily: 'inherit' }} value={reportForm.learningOutcomes}
                        onChange={e => setReportForm(f => ({ ...f, learningOutcomes: e.target.value }))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>Challenges</label>
                        <textarea rows={2} className="input" style={{ resize: 'none', fontFamily: 'inherit' }} value={reportForm.challenges}
                          onChange={e => setReportForm(f => ({ ...f, challenges: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>Achievements</label>
                        <textarea rows={2} className="input" style={{ resize: 'none', fontFamily: 'inherit' }} value={reportForm.achievements}
                          onChange={e => setReportForm(f => ({ ...f, achievements: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>Next Week Goals</label>
                      <textarea rows={2} className="input" style={{ resize: 'none', fontFamily: 'inherit' }} value={reportForm.nextWeekGoals}
                        onChange={e => setReportForm(f => ({ ...f, nextWeekGoals: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>Progress this week ({reportForm.progressPercent}%)</label>
                      <input type="range" min={0} max={100} value={reportForm.progressPercent} style={{ width: '100%', accentColor: '#4f46e5' }}
                        onChange={e => setReportForm(f => ({ ...f, progressPercent: +e.target.value }))} />
                    </div>
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: 12, fontSize: '0.78rem', color: '#92400e' }}>
                      🛡️ <strong>AI Confidentiality Check</strong> will run on submit. Do not include API keys, passwords, or proprietary code.
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => handleSubmitReport(false)} disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                        {submitting ? 'Checking…' : '🛡️ Submit (AI Check)'}
                      </button>
                      <button onClick={() => handleSubmitReport(true)} disabled={submitting} className="btn btn-secondary">Save Draft</button>
                      <button onClick={() => setShowReportForm(false)} className="btn btn-ghost">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📝</div>
                  <p>No reports yet. Submit your first weekly report.</p>
                </div>
              ) : reports.map(r => {
                const sb = statusBadge(r.status);
                return (
                  <div key={r._id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 500, color: '#0f172a' }}>Week {r.weekNumber}</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }}>{r.workSummary}</p>
                      </div>
                      <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 999, fontWeight: 500, background: sb.bg, color: sb.color, flexShrink: 0 }}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                    {r.mentorComment && (
                      <div style={{ marginTop: 12, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: 10, fontSize: '0.78rem', color: '#92400e' }}>
                        <strong>Mentor:</strong> {r.mentorComment}
                      </div>
                    )}
                    {r.confidentialityCheck?.riskLevel && r.confidentialityCheck.riskLevel !== 'SAFE' && !r.confidentialityCheck.skipped && (() => {
                      const rb = riskBadge(r.confidentialityCheck.riskLevel);
                      return (
                        <div style={{ marginTop: 8, fontSize: '0.75rem', padding: '4px 10px', borderRadius: 8, border: `1px solid ${rb.border}`, background: rb.bg, color: rb.color }}>
                          ⚠️ AI Risk: {r.confidentialityCheck.riskLevel}
                        </div>
                      );
                    })()}
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 8 }}>
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'Draft'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
