import { useState, useEffect } from 'react';
import api from '../../services/api';

const warningBadge = {
  ON_TRACK: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  NEEDS_ATTENTION: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  AT_RISK: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
};

export default function MyStudentsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [reviewModal, setReviewModal] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/internship-records?status=ACTIVE');
      setRecords(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = async (record) => {
    setSelected(record);
    const [detailRes, subRes] = await Promise.all([
      api.get(`/monitoring/student/${record.studentId._id}`).catch(() => ({ data: { data: null } })),
      api.get('/final-submissions').catch(() => ({ data: { data: [] } })),
    ]);
    setDetail(detailRes.data.data);
    const sub = subRes.data.data?.find(s => s.studentId?._id === record.studentId._id);
    setSubmissions(sub ? [sub] : []);
  };

  const handleCollegeReview = async () => {
    try {
      setSubmitting(true);
      await api.patch(`/final-submissions/${reviewModal._id}/college-review`, { recommendation });
      setReviewModal(null);
      setRecommendation('');
      if (selected) selectStudent(selected);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid #e0e7ff',
          borderTopColor: '#7c3aed',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 0.35rem 0' }}>College Mentor Advisory Portal</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Supervise your assigned students, inspect weekly log progress, and provide academic recommendations for final completion.
        </p>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Students Roster */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 0.2rem 0' }}>Assigned Students</h2>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{records.length} active internships</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No students assigned yet.</p>
              </div>
            ) : (
              records.map(r => {
                const isSelected = selected?._id === r._id;
                const badge = warningBadge[r.warningStatus] || warningBadge.ON_TRACK;
                return (
                  <div
                    key={r._id}
                    onClick={() => selectStudent(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelected ? '#f5f3ff' : '#ffffff',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#ede9fe',
                      color: '#6d28d9',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {r.studentId?.name ? r.studentId.name.charAt(0).toUpperCase() : 'S'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.15rem 0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.studentId?.name}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.internshipId?.title}
                      </p>
                      {r.warningStatus && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          display: 'inline-block'
                        }}>
                          {r.warningStatus.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Student Details */}
        {selected && detail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header Info */}
            <div style={{
              background: '#ffffff',
              borderRadius: '1.25rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              padding: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', margin: '0 0 0.25rem 0' }}>{selected.studentId?.name}</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.35rem 0' }}>{selected.studentId?.email}</p>
                  <p style={{ fontSize: '0.9rem', color: '#4338ca', fontWeight: 600, margin: 0 }}>
                    {selected.internshipId?.title} • {selected.companyId?.name}
                  </p>
                </div>
                <span style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: (warningBadge[detail.warningStatus] || warningBadge.ON_TRACK).bg,
                  color: (warningBadge[detail.warningStatus] || warningBadge.ON_TRACK).text,
                  border: `1px solid ${(warningBadge[detail.warningStatus] || warningBadge.ON_TRACK).border}`
                }}>
                  {detail.warningStatus?.replace('_', ' ') || 'ON TRACK'}
                </span>
              </div>

              {/* Progress Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.25rem' }}>
                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.85rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>{detail.reports?.length || 0}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.2rem' }}>Total Reports</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.85rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
                    {detail.reports?.filter(r => r.status === 'VERIFIED').length || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.2rem' }}>Verified Logs</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.85rem', textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed' }}>
                    {detail.milestones?.filter(m => m.status === 'COMPLETED').length || 0} / {detail.milestones?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.2rem' }}>Milestones</div>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div style={{
              background: '#ffffff',
              borderRadius: '1.25rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 1rem 0' }}>Recent Weekly Submissions</h3>
              {!detail.reports || detail.reports.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: 0 }}>No reports logged yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {detail.reports.slice(-4).reverse().map(r => (
                    <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.6rem', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Week {r.weekNumber}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.attendanceDays || 5}/7 days attendance</span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          background: r.status === 'VERIFIED' ? '#dcfce7' : '#eff6ff',
                          color: r.status === 'VERIFIED' ? '#15803d' : '#1d4ed8'
                        }}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final Submission Card */}
            {submissions.length > 0 && (
              <div style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>Final Submission Evaluation</h3>
                  {submissions[0].status === 'COMPANY_EVALUATED' && (
                    <button
                      onClick={() => setReviewModal(submissions[0])}
                      style={{
                        background: '#7c3aed',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.5rem 1.25rem',
                        borderRadius: '0.6rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)'
                      }}
                    >
                      Write Faculty Recommendation →
                    </button>
                  )}
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: '#334155', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>
                    {submissions[0].projectSummary}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {submissions[0].skillsLearned?.map(s => (
                      <span key={s} style={{ fontSize: '0.75rem', fontWeight: 600, background: '#f5f3ff', color: '#6d28d9', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {submissions[0].collegeMentorReview?.recommendation && (
                  <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '0.75rem', padding: '1rem', color: '#5b21b6', fontSize: '0.9rem' }}>
                    <strong>Your Academic Recommendation:</strong> {submissions[0].collegeMentorReview.recommendation}
                  </div>
                )}
              </div>
            )}
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
              <p style={{ margin: 0, fontWeight: 600 }}>Select a student from the left panel to inspect their progress</p>
            </div>
          </div>
        )}
      </div>

      {/* Faculty Review Modal */}
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
          <div style={{ background: '#ffffff', borderRadius: '1.25rem', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>College Faculty Review</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Student: {selected?.studentId?.name}</p>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Academic Recommendation & Assessment *
              </label>
              <textarea
                rows={4}
                value={recommendation}
                onChange={e => setRecommendation(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', fontSize: '0.9rem', boxSizing: 'border-box' }}
                placeholder="Write your recommendation for this student's internship completion and academic credit eligibility..."
              />
            </div>
            <div style={{ padding: '1.5rem', paddingTop: 0, display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setReviewModal(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', background: '#fff', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCollegeReview}
                disabled={!recommendation.trim() || submitting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.6rem',
                  border: 'none',
                  background: '#7c3aed',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: !recommendation.trim() || submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
