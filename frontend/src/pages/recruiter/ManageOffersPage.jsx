import { useState, useEffect } from 'react';
import api from '../../services/api';

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
};

export default function ManageOffersPage() {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    applicationId: '', stipend: '', duration: '', joiningDate: '', location: '', additionalNote: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersRes, appsRes] = await Promise.all([
        api.get('/offers'),
        api.get('/applications?status=ACCEPTED'),
      ]);
      setOffers(offersRes.data.data || []);
      // Filter apps that don't already have an offer
      const existingOfferAppIds = new Set((offersRes.data.data || []).map(o => o.applicationId?._id || o.applicationId));
      setApplications((appsRes.data.data || []).filter(a => !existingOfferAppIds.has(a._id)));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      // Find the selected application to get internship/student
      const selectedApp = applications.find(a => a._id === form.applicationId);
      if (!selectedApp) return setError('Please select a candidate');

      await api.post('/offers', {
        applicationId: form.applicationId,
        internshipId: selectedApp.internshipId?._id || selectedApp.internshipId,
        studentId: selectedApp.studentId?._id || selectedApp.studentId,
        companyId: selectedApp.internshipId?.companyId,
        stipend: +form.stipend,
        duration: form.duration,
        joiningDate: form.joiningDate || undefined,
        location: form.location || undefined,
        additionalNote: form.additionalNote || undefined,
      });
      setShowForm(false);
      setForm({ applicationId: '', stipend: '', duration: '', joiningDate: '', location: '', additionalNote: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Offers</h1>
          <p className="text-gray-500 mt-1">Create and track internship offers for accepted candidates.</p>
        </div>
        {applications.length > 0 && (
          <button onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            + Create Offer
          </button>
        )}
      </div>

      {/* Create Offer Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">New Offer</h2>
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate (Accepted Applications) *</label>
              <select required value={form.applicationId}
                onChange={e => setForm(f => ({ ...f, applicationId: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none">
                <option value="">Select a candidate…</option>
                {applications.map(a => (
                  <option key={a._id} value={a._id}>
                    {a.studentId?.name || 'Student'} — {a.internshipId?.title || 'Internship'}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stipend (₹/month) *</label>
                <input type="number" required min={0} value={form.stipend}
                  onChange={e => setForm(f => ({ ...f, stipend: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="15000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                <input type="text" required value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="2 months, 6 weeks…" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                <input type="date" value={form.joiningDate}
                  onChange={e => setForm(f => ({ ...f, joiningDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="Mumbai / Remote" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Note</label>
              <textarea rows={2} value={form.additionalNote}
                onChange={e => setForm(f => ({ ...f, additionalNote: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
                placeholder="Any message for the student..." />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {submitting ? 'Creating…' : 'Create & Send Offer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Offers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Offers ({offers.length})</h2>
        </div>
        {offers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📨</div>
            <p className="font-medium">No offers created yet</p>
            {applications.length > 0 && (
              <button onClick={() => setShowForm(true)}
                className="mt-4 text-indigo-600 text-sm font-medium hover:underline">
                Create your first offer →
              </button>
            )}
            {applications.length === 0 && (
              <p className="text-sm mt-2">Accept applications first to create offers.</p>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Student', 'Internship', 'Stipend', 'Joining', 'Student Response', 'TPO Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.map(o => (
                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{o.studentId?.name}</p>
                    <p className="text-xs text-gray-500">{o.studentId?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-800">{o.internshipId?.title}</p>
                    <p className="text-xs text-gray-500">{o.location || 'Remote'} • {o.duration}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800 text-sm">₹{o.stipend?.toLocaleString()}/mo</td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {o.joiningDate ? new Date(o.joiningDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    {o.status === 'ACCEPTED' ? (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${o.tpoApprovalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : o.tpoApprovalStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {o.tpoApprovalStatus || 'PENDING'}
                      </span>
                    ) : <span className="text-gray-300 text-sm">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
