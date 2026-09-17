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
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const stepColors = {
    SUBMITTED: 'bg-blue-100 text-blue-700',
    COMPANY_EVALUATED: 'bg-purple-100 text-purple-700',
    COLLEGE_REVIEWED: 'bg-amber-100 text-amber-700',
    TPO_APPROVED: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Completion Review</h1>
        <p className="text-gray-500 mt-1">Final approval of internship completion and digital records.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {submissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🏆</div>
            <p>No final submissions yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Student', 'Summary', 'Company Eval', 'College Review', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{s.studentId?.name}</p>
                    <p className="text-xs text-gray-500">{s.studentId?.email}</p>
                  </td>
                  <td className="px-5 py-4 max-w-[200px]">
                    <p className="text-sm text-gray-600 line-clamp-2">{s.projectSummary}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.skillsLearned?.slice(0, 3).map(sk => (
                        <span key={sk} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{sk}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {s.companyEvaluation?.overallRating ? (
                      <span className="text-amber-500 font-bold">{s.companyEvaluation.overallRating}★</span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {s.collegeMentorReview?.recommendation ? (
                      <p className="text-xs text-gray-600 line-clamp-2">{s.collegeMentorReview.recommendation}</p>
                    ) : <span className="text-gray-300 text-sm">Pending</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stepColors[s.status]}`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {s.status === 'COLLEGE_REVIEWED' ? (
                      <button onClick={() => setSelected(s)}
                        className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                        Approve →
                      </button>
                    ) : s.status === 'COMPLETED' ? (
                      <span className="text-green-600 text-sm font-medium">✓ Complete</span>
                    ) : (
                      <span className="text-gray-400 text-xs">Awaiting…</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Approval Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Final Approval</h2>
              <p className="text-sm text-gray-500 mt-1">{selected.studentId?.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                <div className="flex gap-3">
                  {['APPROVED', 'CORRECTION_REQUIRED'].map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                        form.status === s
                          ? s === 'APPROVED' ? 'border-green-500 bg-green-50 text-green-700' : 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-gray-200 text-gray-600'
                      }`}>
                      {s === 'APPROVED' ? '✓ Approve & Complete' : '⚠ Request Correction'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea rows={3} value={form.remarks}
                  onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
                  placeholder="Final remarks for the student's digital record..." />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={handleApprove} disabled={submitting}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 transition-colors ${
                  form.status === 'APPROVED' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}>
                {submitting ? 'Processing…' : form.status === 'APPROVED' ? '🏆 Approve & Complete' : 'Send for Correction'}
              </button>
              <button onClick={() => setSelected(null)}
                className="px-5 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
