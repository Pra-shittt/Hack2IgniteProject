import { useState, useEffect } from 'react';
import api from '../../services/api';

const reportStatusBadge = {
  DRAFT: { bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb' },
  SUBMITTED: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  REVISION_REQUIRED: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  VERIFIED: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
};

export default function MyInternsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reports, setReports] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activeTab, setActiveTab] = useState('reports');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ action: 'VERIFY', comment: '' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', dueDate: '', progress: 0, status: 'PENDING' });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/internship-records?status=ACTIVE');
      setRecords(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const selectIntern = async (record) => {
    setSelected(record);
    setActiveTab('reports');
    const [rpRes, msRes] = await Promise.all([
      api.get(`/weekly-reports?internshipRecordId=${record._id}`).catch(() => ({ data: { data: [] } })),
      api.get(`/internship-records/${record._id}/milestones`).catch(() => ({ data: { data: [] } })),
    ]);
    setReports(rpRes.data.data || []);
    setMilestones(msRes.data.data || []);
  };

  const handleVerify = async () => {
    try {
      setSubmitting(true);
      await api.patch(`/weekly-reports/${reviewModal._id}/verify`, reviewForm);
      setReviewModal(null);
      const rpRes = await api.get(`/weekly-reports?internshipRecordId=${selected._id}`);
      setReports(rpRes.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMilestone = async () => {
    try {
      setSubmitting(true);
      await api.post(`/internship-records/${selected._id}/milestones`, milestoneForm);
      const msRes = await api.get(`/internship-records/${selected._id}/milestones`);
      setMilestones(msRes.data.data || []);
      setShowMilestoneForm(false);
      setMilestoneForm({ title: '', description: '', dueDate: '', progress: 0, status: 'PENDING' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMilestone = async (id, updates) => {
    await api.patch(`/milestones/${id}`, updates);
    const msRes = await api.get(`/internship-records/${selected._id}/milestones`);
    setMilestones(msRes.data.data || []);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid #e0e7ff',
          borderTopColor: '#4f46e5',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 0.35rem 0' }}>Company Mentorship Portal</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Supervise company interns, review weekly sprint reports with AI Confidentiality protection, and set learning milestones.
        </p>
      </div>

      {/* Two-Pane Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Active Interns Roster */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 0.2rem 0' }}>Assigned Interns</h2>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{records.length} active students</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No interns currently assigned.</p>
              </div>
            ) : (
              records.map(r => {
                const isSelected = selected?._id === r._id;
                return (
                  <div
                    key={r._id}
                    onClick={() => selectIntern(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      color: '#1e40af',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {r.studentId?.name ? r.studentId.name.charAt(0).toUpperCase() : 'I'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.15rem 0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.studentId?.name}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.internshipId?.title}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Intern Workspace Panel */}
        {selected ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header info */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', margin: '0 0 0.2rem 0' }}>
                    {selected.studentId?.name}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    {selected.internshipId?.title} • Started {selected.startDate ? new Date(selected.startDate).toLocaleDateString('en-IN') : 'Recently'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#ffffff' }}>
              {['reports', 'milestones'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    flex: 1,
                    padding: '0.9rem 1rem',
                    border: 'none',
                    borderBottom: activeTab === t ? '3px solid #4f46e5' : '3px solid transparent',
                    background: 'transparent',
                    color: activeTab === t ? '#4f46e5' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {t === 'reports' ? `Weekly Reports (${reports.length})` : `Milestones (${milestones.length})`}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '1.5rem' }}>
              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
                      <p style={{ margin: 0, fontWeight: 600 }}>No weekly reports logged yet.</p>
                    </div>
                  ) : (
                    reports.map(r => {
                      const badge = reportStatusBadge[r.status] || reportStatusBadge.DRAFT;
                      const hasConfidentialityRisk = r.confidentialityCheck?.riskLevel && r.confidentialityCheck.riskLevel !== 'SAFE' && !r.confidentialityCheck.skipped;

                      return (
                        <div key={r._id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.85rem', padding: '1.25rem', background: '#ffffff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>
                                Week {r.weekNumber} Activity Log
                              </h4>
                              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                                Recorded: {r.attendanceDays || 5}/7 days • Self-rated Progress: {r.progressPercent || 0}%
                              </p>
                            </div>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.25rem 0.7rem',
                              borderRadius: '9999px',
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`
                            }}>
                              {r.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.6rem', border: '1px solid #f1f5f9', marginBottom: '0.75rem' }}>
                            <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                              {r.workSummary}
                            </p>
                          </div>

                          {r.skillsUsed?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                              {r.skillsUsed.map(s => (
                                <span key={s} style={{ fontSize: '0.75rem', background: '#eef2ff', color: '#4338ca', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600 }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* AI Confidentiality Alert banner */}
                          {hasConfidentialityRisk ? (
                            <div style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '0.6rem',
                              padding: '0.75rem 1rem',
                              color: '#991b1b',
                              fontSize: '0.82rem',
                              marginBottom: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span>🛡️</span>
                              <div>
                                <strong>AI Confidentiality Guard:</strong> {r.confidentialityCheck.riskLevel} risk flagged
                                ({r.confidentialityCheck.flaggedCategories?.join(', ') || 'Sensitive terms'})
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: '0.6rem',
                              padding: '0.5rem 0.85rem',
                              color: '#166534',
                              fontSize: '0.78rem',
                              marginBottom: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}>
                              <span>✓</span> <strong>AI Confidentiality Guard:</strong> Verified Clean — No company credentials or NDA breaches detected.
                            </div>
                          )}

                          {r.mentorComment && (
                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.6rem', padding: '0.65rem 0.9rem', fontSize: '0.85rem', color: '#92400e', marginBottom: '0.75rem' }}>
                              <strong>Your Feedback:</strong> {r.mentorComment}
                            </div>
                          )}

                          {r.status === 'SUBMITTED' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                              <button
                                onClick={() => { setReviewModal(r); setReviewForm({ action: 'VERIFY', comment: '' }); }}
                                style={{
                                  background: '#4f46e5',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '0.45rem 1.15rem',
                                  borderRadius: '0.6rem',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
                                }}
                              >
                                Review & Verify Report →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Milestones Tab */}
              {activeTab === 'milestones' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setShowMilestoneForm(true)}
                      style={{
                        background: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1.25rem',
                        borderRadius: '0.6rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
                      }}
                    >
                      + Add New Sprint Milestone
                    </button>
                  </div>

                  {showMilestoneForm && (
                    <div style={{ background: '#f8fafc', border: '2px dashed #818cf8', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Create Sprint Milestone</h4>
                      <input
                        type="text"
                        placeholder="Milestone Title (e.g., Implement Payment Gateway Integration) *"
                        value={milestoneForm.title}
                        onChange={e => setMilestoneForm(f => ({ ...f, title: e.target.value }))}
                        style={{ padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                      />
                      <textarea
                        rows={2}
                        placeholder="Deliverable details and technical acceptance criteria..."
                        value={milestoneForm.description}
                        onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))}
                        style={{ padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      />
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Target Due Date</label>
                        <input
                          type="date"
                          value={milestoneForm.dueDate}
                          onChange={e => setMilestoneForm(f => ({ ...f, dueDate: e.target.value }))}
                          style={{ padding: '0.5rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <button
                          onClick={handleAddMilestone}
                          disabled={!milestoneForm.title || submitting}
                          style={{
                            flex: 1,
                            padding: '0.65rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#4f46e5',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          {submitting ? 'Adding…' : 'Create Milestone'}
                        </button>
                        <button
                          onClick={() => setShowMilestoneForm(false)}
                          style={{ padding: '0.65rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', background: '#ffffff', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {milestones.length === 0 && !showMilestoneForm ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#9ca3af' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎯</div>
                      <p style={{ margin: 0, fontWeight: 600 }}>No sprint milestones created yet.</p>
                    </div>
                  ) : (
                    milestones.map(m => (
                      <div key={m._id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.85rem', padding: '1.25rem', background: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>{m.title}</h4>
                            {m.description && <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 0.35rem 0' }}>{m.description}</p>}
                            {m.dueDate && (
                              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                                Due: {new Date(m.dueDate).toLocaleDateString('en-IN')}
                              </p>
                            )}
                          </div>
                          <select
                            value={m.status}
                            onChange={e => handleUpdateMilestone(m._id, { status: e.target.value, progress: e.target.value === 'COMPLETED' ? 100 : m.progress })}
                            style={{ padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.8rem', fontWeight: 600, background: '#fff' }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.75rem' }}>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={m.progress}
                            onChange={e => handleUpdateMilestone(m._id, { progress: +e.target.value })}
                            style={{ flex: 1, accentColor: '#4f46e5', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', width: '45px', textAlign: 'right' }}>
                            {m.progress}%
                          </span>
                        </div>

                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', marginTop: '0.5rem' }}>
                          <div style={{ width: `${m.progress}%`, height: '100%', background: m.status === 'COMPLETED' ? '#16a34a' : '#4f46e5', borderRadius: '9999px', transition: 'width 0.2s' }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '360px',
            color: '#9ca3af'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👈</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Select an intern to view weekly reports and set milestones</p>
            </div>
          </div>
        )}
      </div>

      {/* Verify Report Modal */}
      {reviewModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '1.25rem', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                Review Week {reviewModal.weekNumber} Report
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '0.6rem', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  {reviewModal.workSummary}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Verification Action
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { key: 'VERIFY', label: '✓ Verify & Endorse', bg: '#16a34a' },
                    { key: 'REVISION', label: '↩ Request Revision', bg: '#f59e0b' }
                  ].map(a => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => setReviewForm(f => ({ ...f, action: a.key }))}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '0.6rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        border: reviewForm.action === a.key ? 'none' : '1px solid #d1d5db',
                        background: reviewForm.action === a.key ? a.bg : '#f8fafc',
                        color: reviewForm.action === a.key ? '#ffffff' : '#4b5563'
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Mentor Comment & Feedback <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Notes on code review, milestone adherence, or guidelines..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReviewModal(null)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', background: '#fff', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.6rem',
                    border: 'none',
                    background: reviewForm.action === 'VERIFY' ? '#16a34a' : '#f59e0b',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Saving…' : reviewForm.action === 'VERIFY' ? 'Confirm Verification' : 'Request Revision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
