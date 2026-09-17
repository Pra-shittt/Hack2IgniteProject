import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function FinalSubmissionPage() {
  const [record, setRecord] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    projectSummary: '',
    skillsLearned: '',
    finalReportUrl: '',
    presentationUrl: '',
    certificateUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordRes, subRes] = await Promise.all([
        api.get('/internship-records/my').catch(() => ({ data: { data: null } })),
        api.get('/final-submissions/my').catch(() => ({ data: { data: null } })),
      ]);
      setRecord(recordRes.data.data);
      setSubmission(subRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const skills = form.skillsLearned
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await api.post('/final-submissions', {
        ...form,
        skillsLearned: skills,
      });
      setSubmission(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit final work');
    } finally {
      setSubmitting(false);
    }
  };

  const statusSteps = [
    { key: 'SUBMITTED', label: 'Submitted', icon: '📝' },
    { key: 'COMPANY_EVALUATED', label: 'Company Evaluated', icon: '🏢' },
    { key: 'COLLEGE_REVIEWED', label: 'College Reviewed', icon: '🎓' },
    { key: 'TPO_APPROVED', label: 'TPO Approved', icon: '✅' },
    { key: 'COMPLETED', label: 'Completed', icon: '🏆' },
  ];

  const currentStepIndex = submission
    ? statusSteps.findIndex(s => s.key === submission.status)
    : -1;

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

  if (!record) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🎓</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>No Active Internship</h2>
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>You need an active internship record to submit your final work.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '1.25rem',
        padding: '2rem',
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', display: 'inline-block', marginBottom: '0.75rem' }}>
              Final Evaluation & Completion
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Final Internship Submission</h1>
            <p style={{ color: '#e0e7ff', marginTop: '0.5rem', fontSize: '0.95rem', margin: '0.5rem 0 0 0' }}>
              Submit your work, presentation, and achievements for evaluation by your Company Mentor, College Mentor, and TPO.
            </p>
          </div>
          {submission && (
            <div style={{
              background: '#ffffff',
              color: '#4f46e5',
              padding: '0.5rem 1.25rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              Status: {submission.status}
            </div>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      {submission && (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '1.75rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 1.5rem 0' }}>Completion Progress</h2>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {statusSteps.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: idx < statusSteps.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '90px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      border: `2px solid ${isPassed ? '#4f46e5' : '#d1d5db'}`,
                      background: isPassed ? '#4f46e5' : '#f9fafb',
                      color: isPassed ? '#ffffff' : '#9ca3af',
                      transition: 'all 0.3s'
                    }}>
                      {isPassed ? '✓' : step.icon}
                    </div>
                    <p style={{
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      textAlign: 'center',
                      fontWeight: isPassed ? 700 : 500,
                      color: isPassed ? '#4f46e5' : '#6b7280',
                      lineHeight: 1.3,
                      margin: '0.5rem 0 0 0'
                    }}>
                      {step.label}
                    </p>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '3px',
                      margin: '0 0.5rem',
                      marginBottom: '1.25rem',
                      background: idx < currentStepIndex ? '#4f46e5' : '#e5e7eb',
                      borderRadius: '9999px'
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Company Evaluation Block */}
      {submission?.companyEvaluation?.overallRating && (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '1.75rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏢</span> Company Mentor Evaluation
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            {[
              ['Participation', submission.companyEvaluation.participation],
              ['Professionalism', submission.companyEvaluation.professionalism],
              ['Technical Learning', submission.companyEvaluation.technicalLearning],
              ['Communication', submission.companyEvaluation.communication],
            ].map(([label, rating]) => (
              <div key={label} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f9fafb',
                border: '1px solid #f3f4f6',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 500 }}>{label}</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: '1rem', color: s <= rating ? '#eab308' : '#e5e7eb' }}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {submission.companyEvaluation.feedback && (
            <div style={{
              marginTop: '1.25rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              fontSize: '0.9rem',
              color: '#1e3a8a',
              lineHeight: 1.5
            }}>
              <strong>Mentor Feedback:</strong> {submission.companyEvaluation.feedback}
            </div>
          )}
        </div>
      )}

      {/* College Mentor Review */}
      {submission?.collegeMentorReview?.recommendation && (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '1.75rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🎓</span> College Faculty Review
          </h2>
          <p style={{ color: '#374151', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>{submission.collegeMentorReview.recommendation}</p>
        </div>
      )}

      {/* TPO Approval */}
      {submission?.tpoApproval?.status && (
        <div style={{
          borderRadius: '1.25rem',
          border: `1px solid ${submission.tpoApproval.status === 'APPROVED' ? '#bbf7d0' : '#fde68a'}`,
          background: submission.tpoApproval.status === 'APPROVED' ? '#f0fdf4' : '#fffbeb',
          padding: '1.5rem 1.75rem'
        }}>
          <h2 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
            color: submission.tpoApproval.status === 'APPROVED' ? '#166534' : '#92400e'
          }}>
            {submission.tpoApproval.status === 'APPROVED' ? '✅ TPO Approved — Internship Formally Completed!' : '⚠️ TPO: Review / Correction Required'}
          </h2>
          {submission.tpoApproval.remarks && (
            <p style={{ fontSize: '0.9rem', color: '#374151', margin: 0 }}>{submission.tpoApproval.remarks}</p>
          )}
        </div>
      )}

      {/* Submission Form OR Submitted Details View */}
      {!submission ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '2rem'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>Submit Final Work</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
            Fill out your project wrap-up details. Once submitted, it enters the verification workflow.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Project Summary & Key Contributions *
              </label>
              <textarea
                rows={4}
                required
                value={form.projectSummary}
                onChange={e => setForm(f => ({ ...f, projectSummary: e.target.value }))}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="Summarize the core features built, challenges solved, and overall outcomes..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Skills & Technologies Mastered * <span style={{ fontWeight: 400, color: '#9ca3af' }}>(comma-separated)</span>
              </label>
              <input
                type="text"
                required
                value={form.skillsLearned}
                onChange={e => setForm(f => ({ ...f, skillsLearned: e.target.value }))}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="React, TypeScript, Node.js, Express, MongoDB, Docker..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Final Report URL <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="url"
                  value={form.finalReportUrl}
                  onChange={e => setForm(f => ({ ...f, finalReportUrl: e.target.value }))}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Presentation Deck URL <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="url"
                  value={form.presentationUrl}
                  onChange={e => setForm(f => ({ ...f, presentationUrl: e.target.value }))}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://slides.google.com/..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Certificate / Completion Proof <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="url"
                  value={form.certificateUrl}
                  onChange={e => setForm(f => ({ ...f, certificateUrl: e.target.value }))}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://..."
                />
              </div>
            </div>

            {error && (
              <div style={{ color: '#dc2626', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.9rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'background 0.2s',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
            >
              {submitting ? 'Submitting to Portal…' : '📤 Submit Final Work for Approval'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 }}>Your Final Submission Summary</h2>
            <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#3730a3', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontWeight: 600 }}>
              Submitted on {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString('en-IN') : 'Recently'}
            </span>
          </div>

          <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '0.875rem', border: '1px solid #f3f4f6', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>Project Summary</h4>
            <p style={{ fontSize: '0.95rem', color: '#1f2937', margin: 0, lineHeight: 1.6 }}>{submission.projectSummary}</p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', margin: '0 0 0.6rem 0' }}>Skills Learned</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {submission.skillsLearned?.map(s => (
                <span key={s} style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: '#eef2ff',
                  color: '#4f46e5',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  border: '1px solid #e0e7ff'
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
            {submission.finalReportUrl && (
              <a href={submission.finalReportUrl} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#4f46e5',
                textDecoration: 'none',
                background: '#f5f3ff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd6fe'
              }}>
                📄 View Final Report ↗
              </a>
            )}
            {submission.presentationUrl && (
              <a href={submission.presentationUrl} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#4f46e5',
                textDecoration: 'none',
                background: '#f5f3ff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #ddd6fe'
              }}>
                📊 View Presentation Slides ↗
              </a>
            )}
            {submission.certificateUrl && (
              <a href={submission.certificateUrl} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#166534',
                textDecoration: 'none',
                background: '#f0fdf4',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #bbf7d0'
              }}>
                🏆 View Certificate ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
