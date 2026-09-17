import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function CompletionReviewPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: 'APPROVED', remarks: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/final-submissions');
      setSubmissions(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await api.patch(`/final-submissions/${selected._id}/tpo-approve`, {
        status: form.status,
        remarks: form.remarks,
      });
      setSelected(null);
      fetchSubmissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update approval');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepBadge = (s) => {
    const map = {
      SUBMITTED: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      COMPANY_EVALUATED: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
      COLLEGE_REVIEWED: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
      TPO_APPROVED: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
      COMPLETED: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
    };
    return map[s] || { bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb' };
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 0.35rem 0' }}>Completion Review & Sign-Off</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Final approval of student internship projects, generating verified digital completion records.
        </p>
      </div>

      {/* Submissions Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '1.25rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4.5rem 1rem', color: '#9ca3af' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🏆</div>
            <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>No final submissions awaiting TPO review yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Project Summary</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Company Eval</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Faculty Review</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Stage</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => {
                  const badge = getStepBadge(s.status);
                  return (
                    <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.2rem 0', fontSize: '0.92rem' }}>
                          {s.studentId?.name || 'Student'}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{s.studentId?.email}</p>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', maxWidth: '280px' }}>
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#475569',
                          margin: '0 0 0.35rem 0',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {s.projectSummary}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {s.skillsLearned?.slice(0, 3).map(sk => (
                            <span key={sk} style={{ fontSize: '0.7rem', background: '#eef2ff', color: '#4338ca', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        {s.companyEvaluation?.overallRating ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#fffbeb', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', border: '1px solid #fde68a', color: '#b45309', fontWeight: 700, fontSize: '0.85rem' }}>
                            <span>★</span> {s.companyEvaluation.overallRating}
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {s.collegeMentorReview?.recommendation ? (
                          <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, fontStyle: 'italic', maxWidth: '180px' }}>
                            "{s.collegeMentorReview.recommendation}"
                          </p>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Pending Review</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}>
                          {s.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {s.status === 'COLLEGE_REVIEWED' ? (
                          <button
                            onClick={() => setSelected(s)}
                            style={{
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.45rem 1rem',
                              borderRadius: '0.6rem',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                            }}
                          >
                            Final Approval →
                          </button>
                        ) : s.status === 'COMPLETED' ? (
                          <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            ✓ Completed
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {s.status === 'TPO_APPROVED' ? 'Finalizing' : 'Awaiting Review'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TPO Decision Modal */}
      {selected && (
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
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>
                TPO Final Internship Approval
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Candidate: <strong>{selected.studentId?.name}</strong>
              </p>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Institutional Sign-Off Decision
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['APPROVED', 'CORRECTION_REQUIRED'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: st }))}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '0.6rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        border: form.status === st ? 'none' : '1px solid #d1d5db',
                        background: form.status === st ? (st === 'APPROVED' ? '#16a34a' : '#f59e0b') : '#f8fafc',
                        color: form.status === st ? '#ffffff' : '#4b5563'
                      }}
                    >
                      {st === 'APPROVED' ? '🏆 Approve & Issue Record' : '⚠️ Request Revision'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Institutional Endorsement Remarks
                </label>
                <textarea
                  rows={3}
                  value={form.remarks}
                  onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                  placeholder="Official completion endorsement and performance remarks..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', background: '#fff', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.6rem',
                    border: 'none',
                    background: form.status === 'APPROVED' ? '#16a34a' : '#f59e0b',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Submitting…' : form.status === 'APPROVED' ? 'Confirm Approval' : 'Send for Revision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
