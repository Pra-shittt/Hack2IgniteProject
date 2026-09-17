import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ApprovalCenterPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [processing, setProcessing] = useState(null);
  const [modal, setModal] = useState(null); // { approval }
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

  const statusBadge = (s) => {
    const map = { PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700' };
    return map[s] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approval Center & NOC</h1>
        <p className="text-gray-500 mt-1">Review internship offers, issue NOC, and activate internships.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : approvals.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-medium">No {filter.toLowerCase()} approvals</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Student', 'Internship', 'Stipend', 'Joining Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {approvals.map(a => (
                <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{a.studentId?.name}</p>
                    <p className="text-xs text-gray-500">{a.studentId?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-800">{a.internshipId?.title}</p>
                    <p className="text-xs text-gray-500">{a.internshipId?.duration} • {a.internshipId?.location || 'Remote'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">₹{a.offerId?.stipend?.toLocaleString() || '—'}/mo</td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {a.offerId?.joiningDate ? new Date(a.offerId.joiningDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(a.status)}`}>{a.status}</span>
                    {a.nocIssued && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">NOC ✓</span>}
                  </td>
                  <td className="px-5 py-4">
                    {a.status === 'PENDING' ? (
                      <button onClick={() => openModal(a)}
                        className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                        Review →
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">{a.reviewedAt ? new Date(a.reviewedAt).toLocaleDateString() : '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Review Offer — {modal.approval.studentId?.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{modal.approval.internshipId?.title}</p>
            </div>
            <div className="p-6 space-y-4">
              {/* Offer Summary */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Stipend</span><span className="font-medium">₹{modal.approval.offerId?.stipend?.toLocaleString()}/mo</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">{modal.approval.offerId?.duration}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{modal.approval.offerId?.location || 'Remote'}</span></div>
                {modal.approval.offerId?.joiningDate && (
                  <div className="flex justify-between"><span className="text-gray-500">Joining Date</span><span className="font-medium">{new Date(modal.approval.offerId.joiningDate).toLocaleDateString()}</span></div>
                )}
              </div>

              {/* Decision */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                <div className="flex gap-3">
                  {['APPROVED', 'REJECTED'].map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                        form.status === s
                          ? s === 'APPROVED' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {s === 'APPROVED' ? '✓ Approve & Issue NOC' : '✕ Reject'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign mentors on approval */}
              {form.status === 'APPROVED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Mentor ID <span className="text-gray-400">(optional)</span></label>
                  <input type="text" value={form.companyMentorId}
                    onChange={e => setForm(f => ({ ...f, companyMentorId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                    placeholder="Paste company mentor user ID" />
                  <p className="text-xs text-gray-400 mt-1">Can be assigned later from Internship Records</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks <span className="text-gray-400">(optional)</span></label>
                <textarea rows={3} value={form.remarks}
                  onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
                  placeholder="Any notes for the student or record..." />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={handleReview} disabled={!!processing}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 ${
                  form.status === 'APPROVED' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
                }`}>
                {processing ? 'Processing…' : form.status === 'APPROVED' ? 'Approve & Issue NOC' : 'Reject'}
              </button>
              <button onClick={() => setModal(null)}
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
