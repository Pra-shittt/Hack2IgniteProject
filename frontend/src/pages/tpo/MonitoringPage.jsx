import { useState, useEffect } from 'react';
import api from '../../services/api';

const warningColors = {
  ON_TRACK: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', dot: '#10b981', label: 'On Track' },
  NEEDS_ATTENTION: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b', label: 'Needs Attention' },
  AT_RISK: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', dot: '#ef4444', label: 'At Risk' },
};

export default function MonitoringPage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchMonitoring();
  }, []);

  const fetchMonitoring = async () => {
    try {
      setLoading(true);
      const res = await api.get('/monitoring');
      setData(res.data.data || []);
      setSummary(res.data.summary);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (studentId) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/monitoring/student/${studentId}`);
      setDetail(res.data.data);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelect = (record) => {
    setSelected(record);
    fetchDetail(record.studentId._id);
  };

  const filtered = filter === 'ALL' ? data : data.filter(r => r.warningStatus === filter);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1250px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 0.35rem 0' }}>Internship Monitoring Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>
          Real-time tracking of active student internships with AI & rules-based early warnings for attendance and weekly submissions.
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Active Internships', value: summary.total || 0, bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3', icon: '🎓', filterKey: 'ALL' },
            { label: 'On Track', value: summary.onTrack || 0, bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', icon: '✅', filterKey: 'ON_TRACK' },
            { label: 'Needs Attention', value: summary.needsAttention || 0, bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '⚠️', filterKey: 'NEEDS_ATTENTION' },
            { label: 'At Risk', value: summary.atRisk || 0, bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '🚨', filterKey: 'AT_RISK' },
          ].map(card => (
            <div
              key={card.label}
              onClick={() => setFilter(card.filterKey)}
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: '1rem',
                padding: '1.25rem',
                cursor: 'pointer',
                boxShadow: filter === card.filterKey ? '0 0 0 2px #4f46e5' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{card.icon}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: card.text, lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginTop: '0.35rem' }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Two-Pane View */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Students List */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.25rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
              Students {filter !== 'ALL' && `— ${filter.replace('_', ' ')}`}
            </h2>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['ALL', 'ON_TRACK', 'NEEDS_ATTENTION', 'AT_RISK'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: filter === f ? '#4f46e5' : '#f1f5f9',
                    color: filter === f ? '#ffffff' : '#475569'
                  }}
                >
                  {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎓</div>
              <p style={{ margin: 0, fontWeight: 500 }}>No active internships in this status category</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map(record => {
                const w = warningColors[record.warningStatus] || warningColors.ON_TRACK;
                const isSelected = selected?._id === record._id;
                return (
                  <div
                    key={record._id}
                    onClick={() => handleSelect(record)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#e0e7ff',
                      color: '#4338ca',
                      fontWeight: 700,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {record.studentId?.name ? record.studentId.name.charAt(0).toUpperCase() : 'S'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 0.2rem 0', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {record.studentId?.name || 'Student Name'}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {record.internshipId?.title} • {record.companyId?.name}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: w.bg,
                        color: w.text,
                        border: `1px solid ${w.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: w.dot }} />
                        {w.label}
                      </span>
                      {record.latestReport && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Week {record.latestReport.weekNumber} ({record.latestReport.status})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Detail Drawer */}
        {selected && (
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                {selected.studentId?.name}
              </h3>
              <button
                onClick={() => { setSelected(null); setDetail(null); }}
                style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '3px solid #e0e7ff',
                  borderTopColor: '#4f46e5',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : detail ? (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Status Box */}
                <div style={{
                  background: (warningColors[detail.warningStatus] || warningColors.ON_TRACK).bg,
                  border: `1px solid ${(warningColors[detail.warningStatus] || warningColors.ON_TRACK).border}`,
                  padding: '0.85rem 1rem',
                  borderRadius: '0.75rem',
                  color: (warningColors[detail.warningStatus] || warningColors.ON_TRACK).text,
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  Current Status: {(warningColors[detail.warningStatus] || warningColors.ON_TRACK).label}
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', margin: '0 0 0.2rem 0', fontWeight: 600 }}>Start</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                      {detail.record?.startDate ? new Date(detail.record.startDate).toLocaleDateString('en-IN') : '—'}
                    </p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.6rem', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', margin: '0 0 0.2rem 0', fontWeight: 600 }}>End</p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                      {detail.record?.endDate ? new Date(detail.record.endDate).toLocaleDateString('en-IN') : '—'}
                    </p>
                  </div>
                </div>

                {/* Reports Feed */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', margin: '0 0 0.6rem 0' }}>
                    Weekly Reports ({detail.reports?.length || 0})
                  </h4>
                  {(!detail.reports || detail.reports.length === 0) ? (
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>No weekly logs submitted yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                      {detail.reports.slice(-5).reverse().map(r => (
                        <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Week {r.weekNumber}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: r.status === 'VERIFIED' ? '#16a34a' : '#2563eb' }}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assigned Mentors */}
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
                    Assigned Mentors
                  </h4>
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.35rem 0', color: '#1e293b' }}>
                    <strong>Faculty:</strong> {detail.record?.collegeMentorId?.name || 'Assigned by TPO'}
                  </p>
                  <p style={{ fontSize: '0.85rem', margin: 0, color: '#1e293b' }}>
                    <strong>Industry:</strong> {detail.record?.companyMentorId?.name || 'Company Assigned'}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
