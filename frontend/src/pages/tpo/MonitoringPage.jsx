import { useState, useEffect } from 'react';
import api from '../../services/api';

const warningColors = {
  ON_TRACK: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'On Track' },
  NEEDS_ATTENTION: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Needs Attention' },
  AT_RISK: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'At Risk' },
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Internship Monitoring</h1>
        <p className="text-gray-500 mt-1">Real-time tracking of all active internships with early-warning indicators.</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Active Internships', value: summary.total, color: 'bg-indigo-50 text-indigo-700', icon: '🎓' },
            { label: 'On Track', value: summary.onTrack, color: 'bg-green-50 text-green-700', icon: '✅' },
            { label: 'Needs Attention', value: summary.needsAttention, color: 'bg-amber-50 text-amber-700', icon: '⚠️' },
            { label: 'At Risk', value: summary.atRisk, color: 'bg-red-50 text-red-700', icon: '🚨' },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl p-5 ${card.color} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => setFilter(card.label === 'Active Internships' ? 'ALL' :
                card.label === 'On Track' ? 'ON_TRACK' :
                card.label === 'Needs Attention' ? 'NEEDS_ATTENTION' : 'AT_RISK')}>
              <div className="text-2xl mb-1">{card.icon}</div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm font-medium mt-1">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {/* Student List */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Students {filter !== 'ALL' && `— ${filter.replace('_', ' ')}`}</h2>
            <div className="flex gap-2">
              {['ALL', 'ON_TRACK', 'NEEDS_ATTENTION', 'AT_RISK'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🎓</div>
              <p>No active internships found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(record => {
                const w = warningColors[record.warningStatus] || warningColors.ON_TRACK;
                return (
                  <div key={record._id}
                    onClick={() => handleSelect(record)}
                    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?._id === record._id ? 'bg-indigo-50' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600 text-sm shrink-0">
                      {record.studentId?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{record.studentId?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{record.internshipId?.title} • {record.companyId?.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${w.bg} ${w.text}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${w.dot} mr-1`}></span>
                        {w.label}
                      </span>
                      {record.latestReport && (
                        <p className="text-xs text-gray-400">Week {record.latestReport.weekNumber} — {record.latestReport.status}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-96 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">{selected.studentId?.name}</h2>
              <button onClick={() => { setSelected(null); setDetail(null); }} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : detail ? (
              <div className="p-4 space-y-4 overflow-y-auto max-h-[600px]">
                {/* Warning Status */}
                <div className={`rounded-xl p-3 ${warningColors[detail.warningStatus]?.bg} ${warningColors[detail.warningStatus]?.text}`}>
                  <p className="font-semibold text-sm">Status: {warningColors[detail.warningStatus]?.label}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Start</p>
                    <p className="font-medium text-sm">{new Date(detail.record.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">End</p>
                    <p className="font-medium text-sm">{new Date(detail.record.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Reports Summary */}
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Weekly Reports ({detail.reports.length})</h3>
                  {detail.reports.length === 0 ? (
                    <p className="text-xs text-gray-400">No reports submitted yet</p>
                  ) : (
                    <div className="space-y-1">
                      {detail.reports.slice(-5).reverse().map(r => (
                        <div key={r._id} className="flex justify-between items-center text-xs bg-gray-50 rounded-lg p-2">
                          <span className="text-gray-600">Week {r.weekNumber}</span>
                          <span className={`px-1.5 py-0.5 rounded font-medium ${
                            r.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                            r.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                            r.status === 'REVISION_REQUIRED' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{r.status.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Milestones */}
                {detail.milestones.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-700 mb-2">Milestones ({detail.milestones.filter(m => m.status === 'COMPLETED').length}/{detail.milestones.length} done)</h3>
                    <div className="space-y-2">
                      {detail.milestones.map(m => (
                        <div key={m._id} className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600 truncate">{m.title}</span>
                            <span className="text-gray-500 ml-2">{m.progress}%</span>
                          </div>
                          <div className="bg-gray-100 rounded-full h-1.5">
                            <div className={`rounded-full h-1.5 ${m.status === 'COMPLETED' ? 'bg-green-500' : 'bg-indigo-500'}`}
                              style={{ width: `${m.progress}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mentor info */}
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Mentors</h3>
                  <p className="text-xs text-gray-600">College: {detail.record.collegeMentorId?.name || 'Not assigned'}</p>
                  <p className="text-xs text-gray-600">Company: {detail.record.companyMentorId?.name || 'Not assigned'}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
