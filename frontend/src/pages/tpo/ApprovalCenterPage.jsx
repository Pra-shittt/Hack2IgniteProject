import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ApprovalCenterPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [processing, setProcessing] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ status: 'APPROVED', remarks: '', collegeMentorId: '', companyMentorId: '' });
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetchApprovals();
    fetchMentors();
  }, [filter]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/approvals${filter !== 'ALL' ? `?status=${filter}` : ''}`);
      setApprovals(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const res = await api.get('/users?role=COLLEGE_MENTOR&limit=50');
      setMentors(res.data.data || []);
    } catch {}
  };

  const handleReview = async () => {
    if (!modal) return;
    try {
      setProcessing(modal.approval._id);
      await api.patch(`/approvals/${modal.approval._id}`, {
        status: form.status,
        remarks: form.remarks || undefined,
        collegeMentorId: form.collegeMentorId || undefined,
        companyMentorId: form.companyMentorId || undefined,
      });
      setModal(null);
      fetchApprovals();
    } catch (err) {
      alert(err.response?.data?.message || 'Review failed');
    } finally {
      setProcessing(null);
    }
  };

  const openModal = (approval) => {
    setModal({ approval });
    setForm({ status: 'APPROVED', remarks: '', collegeMentorId: '', companyMentorId: '' });
  };

  const getStatusBadge = (s) => {
    if (s === 'APPROVED') return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Approved' };
    if (s === 'REJECTED') return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', label: 'Rejected' };
    return { bg: '#fef3c7', color: '#b45309', border: '#fde68a', label: 'Pending' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 0.35rem 0' }}>Approval Center & NOC</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Review student internship offers, issue official college NOC, and assign academic and industry mentors.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: filter === f ? 'none' : '1px solid #d1d5db',
              background: filter === f ? '#4f46e5' : '#ffffff',
              color: filter === f ? '#ffffff' : '#4b5563',
              boxShadow: filter === f ? '0 4px 10px rgba(79, 70, 229, 0.25)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            {f === 'ALL' ? 'All Requests' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Approvals Table Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '1.25rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '14rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '3px solid #e0e7ff',
              borderTopColor: '#4f46e5',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : approvals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9ca3af' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>📋</div>
            <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>No {filter.toLowerCase()} approvals found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Internship & Company</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stipend</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joining Date</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approval & NOC</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map(a => {
                  const badge = getStatusBadge(a.status);
                  return (
                    <tr key={a._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.15rem 0', fontSize: '0.92rem' }}>{a.studentId?.name || 'Student'}</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{a.studentId?.email}</p>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <p style={{ fontWeight: 600, color: '#334155', margin: '0 0 0.15rem 0', fontSize: '0.9rem' }}>{a.internshipId?.title || 'Internship'}</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                          {a.internshipId?.duration || '12 weeks'} • {a.internshipId?.location || 'Remote'}
                        </p>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                        ₹{a.offerId?.stipend ? a.offerId.stipend.toLocaleString() : '—'}/mo
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                        {a.offerId?.joiningDate ? new Date(a.offerId.joiningDate).toLocaleDateString('en-IN') : 'Immediate'}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`
                          }}>
                            {badge.label}
                          </span>
                          {a.nocIssued && (
                            <span style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe'
                            }}>
                              NOC Issued ✓
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {a.status === 'PENDING' ? (
                          <button
                            onClick={() => openModal(a)}
                            style={{
                              background: '#4f46e5',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.45rem 1rem',
                              borderRadius: '0.6rem',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: '0 2px 5px rgba(79, 70, 229, 0.2)'
                            }}
                          >
                            Review & Issue NOC →
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {a.reviewedAt ? new Date(a.reviewedAt).toLocaleDateString('en-IN') : 'Processed'}
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

      {/* Review & NOC Modal */}
      {modal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
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
            maxWidth: '560px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem 0' }}>
                Review Offer — {modal.approval.studentId?.name}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {modal.approval.internshipId?.title}
              </p>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{
                background: '#f1f5f9',
                borderRadius: '0.75rem',
                padding: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Offered Monthly Stipend</span>
                  <strong style={{ color: '#111827' }}>₹{modal.approval.offerId?.stipend?.toLocaleString() || 'Unpaid'}/mo</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Expected Joining Date</span>
                  <strong style={{ color: '#111827' }}>
                    {modal.approval.offerId?.joiningDate ? new Date(modal.approval.offerId.joiningDate).toLocaleDateString('en-IN') : 'Immediate'}
                  </strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Approval Decision
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['APPROVED', 'REJECTED'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: st }))}
                      style={{
                        flex: 1,
                        padding: '0.65rem',
                        borderRadius: '0.6rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        border: form.status === st ? 'none' : '1px solid #d1d5db',
                        background: form.status === st ? (st === 'APPROVED' ? '#16a34a' : '#dc2626') : '#f9fafb',
                        color: form.status === st ? '#ffffff' : '#4b5563'
                      }}
                    >
                      {st === 'APPROVED' ? '✓ Approve & Issue NOC' : '✕ Reject'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Assign College Faculty Mentor
                </label>
                <select
                  value={form.collegeMentorId}
                  onChange={e => setForm(f => ({ ...f, collegeMentorId: e.target.value }))}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', fontSize: '0.85rem', background: '#fff' }}
                >
                  <option value="">-- Select Faculty Mentor --</option>
                  {mentors.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.department || 'CSE / IT'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  TPO Remarks / NOC Endorsement
                </label>
                <textarea
                  rows={3}
                  value={form.remarks}
                  onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                  placeholder="Official endorsement remarks or guidelines for the student..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #d1d5db', background: '#ffffff', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReview}
                  disabled={processing}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.6rem',
                    border: 'none',
                    background: form.status === 'APPROVED' ? '#4f46e5' : '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: processing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? 'Processing…' : 'Submit Decision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
