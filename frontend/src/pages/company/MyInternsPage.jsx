import { useState, useEffect } from 'react';
import api from '../../services/api';

const reportStatusColors = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  REVISION_REQUIRED: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-green-100 text-green-700',
};

export default function MyInternsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reports, setReports] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activeTab, setActiveTab] = useState('reports');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ action: 'VERIFY', comment: '' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', dueDate: '', progress: 0, status: 'PENDING' });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      setLoading(true);
      // Company mentor gets records where they are the mentor
      const res = await api.get('/internship-records?status=ACTIVE');
      // Filter to only records assigned to this company mentor (backend handles auth context)
      setRecords(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const selectIntern = async (record) => {
    setSelected(record);
    setActiveTab('reports');
    const [rpRes, msRes] = await Promise.all([
      api.get(`/weekly-reports?internshipRecordId=${record._id}`),
      api.get(`/internship-records/${record._id}/milestones`),
    ]);
    setReports(rpRes.data.data || []);
    setMilestones(msRes.data.data || []);
  };

  const handleVerify = async () => {
    try {
      setSubmitting(true);
      await api.patch(`/weekly-reports/${reviewModal._id}/verify`, reviewForm);
      setReviewModal(null);
      const rpRes = await api.get(`/weekly-reports?internshipRecordId=${selected._id}`);
      setReports(rpRes.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMilestone = async () => {
    try {
      setSubmitting(true);
      await api.post(`/internship-records/${selected._id}/milestones`, milestoneForm);
      const msRes = await api.get(`/internship-records/${selected._id}/milestones`);
      setMilestones(msRes.data.data || []);
      setShowMilestoneForm(false);
      setMilestoneForm({ title: '', description: '', dueDate: '', progress: 0, status: 'PENDING' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMilestone = async (id, updates) => {
    await api.patch(`/milestones/${id}`, updates);
    const msRes = await api.get(`/internship-records/${selected._id}/milestones`);
    setMilestones(msRes.data.data || []);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Intern List */}
      <div className="w-72 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">My Interns</h2>
          <p className="text-xs text-gray-500 mt-0.5">{records.length} active</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {records.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-400">
              <div className="text-4xl mb-2">👤</div>
              <p className="text-sm">No interns assigned yet.</p>
            </div>
          ) : records.map(r => (
            <div key={r._id}
              onClick={() => selectIntern(r)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?._id === r._id ? 'bg-indigo-50' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600 text-sm shrink-0">
                {r.studentId?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{r.studentId?.name}</p>
                <p className="text-xs text-gray-500 truncate">{r.internshipId?.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selected ? (
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg">{selected.studentId?.name}</h2>
            <p className="text-sm text-gray-500">{selected.internshipId?.title} • Started {new Date(selected.startDate).toLocaleDateString()}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['reports', 'milestones'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${activeTab === t ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
                {t} {t === 'reports' ? `(${reports.length})` : `(${milestones.length})`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">📝</div>
                    <p>No reports submitted yet.</p>
                  </div>
                ) : reports.map(r => (
                  <div key={r._id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Week {r.weekNumber}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{r.workSummary}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ml-3 shrink-0 ${reportStatusColors[r.status]}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                    {r.skillsUsed?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.skillsUsed.map(s => <span key={s} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{s}</span>)}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">Attendance: {r.attendanceDays}/7 days • Progress: {r.progressPercent}%</p>
                      {r.status === 'SUBMITTED' && (
                        <button onClick={() => { setReviewModal(r); setReviewForm({ action: 'VERIFY', comment: '' }); }}
                          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                          Review
                        </button>
                      )}
                    </div>
                    {r.mentorComment && (
                      <div className="mt-2 text-xs bg-amber-50 border border-amber-100 rounded-lg p-2 text-amber-700">
                        Your comment: {r.mentorComment}
                      </div>
                    )}
                    {/* AI check result */}
                    {r.confidentialityCheck?.riskLevel && r.confidentialityCheck.riskLevel !== 'SAFE' && !r.confidentialityCheck.skipped && (
                      <div className="mt-2 text-xs bg-red-50 border border-red-100 rounded-lg p-2 text-red-600">
                        ⚠️ AI flagged: {r.confidentialityCheck.riskLevel} risk — {r.confidentialityCheck.flaggedCategories?.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button onClick={() => setShowMilestoneForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    + Add Milestone
                  </button>
                </div>

                {showMilestoneForm && (
                  <div className="border-2 border-indigo-200 rounded-xl p-4 bg-indigo-50 space-y-3">
                    <h4 className="font-medium text-gray-900">New Milestone</h4>
                    <input type="text" placeholder="Title *" value={milestoneForm.title}
                      onChange={e => setMilestoneForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    <textarea placeholder="Description" value={milestoneForm.description} rows={2}
                      onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none" />
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">Due Date</label>
                        <input type="date" value={milestoneForm.dueDate}
                          onChange={e => setMilestoneForm(f => ({ ...f, dueDate: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleAddMilestone} disabled={!milestoneForm.title || submitting}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        {submitting ? 'Adding…' : 'Add Milestone'}
                      </button>
                      <button onClick={() => setShowMilestoneForm(false)} className="px-4 text-gray-500 text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                {milestones.length === 0 && !showMilestoneForm ? (
                  <div className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>No milestones yet. Add one to track intern progress.</p>
                  </div>
                ) : milestones.map(m => (
                  <div key={m._id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{m.title}</p>
                        {m.description && <p className="text-sm text-gray-500 mt-1">{m.description}</p>}
                        {m.dueDate && <p className="text-xs text-gray-400 mt-1">Due: {new Date(m.dueDate).toLocaleDateString()}</p>}
                      </div>
                      <select value={m.status}
                        onChange={e => handleUpdateMilestone(m._id, { status: e.target.value, progress: e.target.value === 'COMPLETED' ? 100 : m.progress })}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none ml-3">
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="range" min={0} max={100} value={m.progress}
                        onChange={e => handleUpdateMilestone(m._id, { progress: +e.target.value })}
                        className="flex-1 accent-indigo-600" />
                      <span className="text-sm text-gray-600 w-10">{m.progress}%</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 mt-2">
                      <div className="bg-indigo-500 rounded-full h-2 transition-all" style={{ width: `${m.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-5xl mb-3">👈</div>
            <p>Select an intern to view their progress</p>
          </div>
        </div>
      )}

      {/* Verify Report Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Review Week {reviewModal.weekNumber} Report</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm">
                <p className="text-gray-600">{reviewModal.workSummary}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="flex gap-3">
                  {[{ key: 'VERIFY', label: '✓ Verify', style: 'border-green-500 bg-green-50 text-green-700' },
                    { key: 'REVISION', label: '↩ Request Revision', style: 'border-amber-400 bg-amber-50 text-amber-700' }].map(a => (
                    <button key={a.key} onClick={() => setReviewForm(f => ({ ...f, action: a.key }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${reviewForm.action === a.key ? a.style : 'border-gray-200 text-gray-600'}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment <span className="text-gray-400">(optional)</span></label>
                <textarea rows={3} value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
                  placeholder="Feedback for the student..." />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={handleVerify} disabled={submitting}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 transition-colors ${
                  reviewForm.action === 'VERIFY' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}>
                {submitting ? 'Saving…' : reviewForm.action === 'VERIFY' ? 'Verify Report' : 'Request Revision'}
              </button>
              <button onClick={() => setReviewModal(null)} className="px-5 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
