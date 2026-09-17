import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function FinalEvaluationPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    participation: 4,
    professionalism: 4,
    technicalLearning: 4,
    communication: 4,
    overallRating: 4,
    feedback: '',
  });
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

  const handleEvaluate = async () => {
    try {
      setSubmitting(true);
      await api.patch(`/final-submissions/${selected._id}/evaluate`, form);
      setSelected(null);
      fetchSubmissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingInput = ({ label, field }) => (
    <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{label}</label>
        <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1rem' }}>
          {'★'.repeat(form[field])}{'☆'.repeat(5 - form[field])} ({form[field]}/5)
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: +e.target.value }))}
        style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
        <span>1 - Needs Improvement</span>
        <span>5 - Outstanding</span>
      </div>
    </div>
  );

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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 0.35rem 0' }}>Company Intern Final Evaluations</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Evaluate interns upon project completion across technical learning, professionalism, and industry contributions.
        </p>
      </div>

      {/* Submissions List Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '1.25rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4.5rem 1rem', color: '#9ca3af' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📊</div>
            <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>No final submissions to evaluate yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Intern Candidate</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Project Summary</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Technologies</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Submission Date</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Score / Rating</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.15rem 0', fontSize: '0.92rem' }}>
                        {s.studentId?.name || 'Intern'}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{s.studentId?.email}</p>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', maxWidth: '240px' }}>
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#475569',
                        margin: 0,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {s.projectSummary}
                      </p>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {s.skillsLearned?.slice(0, 3).map(sk => (
                          <span key={sk} style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-IN') : 'Recently'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {s.companyEvaluation?.overallRating ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                          <span>★</span> {s.companyEvaluation.overallRating} / 5
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Awaiting Evaluation</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {s.status === 'SUBMITTED' ? (
                        <button
                          onClick={() => {
                            setSelected(s);
                            setForm({ participation: 4, professionalism: 4, technicalLearning: 4, communication: 4, overallRating: 4, feedback: '' });
                          }}
                          style={{
                            background: '#4f46e5',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.45rem 1rem',
                            borderRadius: '0.6rem',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
                          }}
                        >
                          Evaluate Intern →
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>
                          ✓ Evaluated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Evaluation Modal */}
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
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>
                Intern Performance Evaluation
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Candidate: <strong>{selected.studentId?.name}</strong>
              </p>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <RatingInput label="Participation & Punctuality" field="participation" />
              <RatingInput label="Professional Conduct & Teamwork" field="professionalism" />
              <RatingInput label="Technical Competency & Code Quality" field="technicalLearning" />
              <RatingInput label="Communication & Presentation" field="communication" />
              <RatingInput label="Overall Industry Rating" field="overallRating" />

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Mentor Feedback & Recommendation Remarks
                </label>
                <textarea
                  rows={3}
                  value={form.feedback}
                  onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))}
                  placeholder="Key strengths demonstrated, areas for future growth, or PPO recommendation notes..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }}
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
                  onClick={handleEvaluate}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.6rem',
                    border: 'none',
                    background: '#4f46e5',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit Company Evaluation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
