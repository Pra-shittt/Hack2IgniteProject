import { useState, useEffect } from 'react';
import api from '../../services/api';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  REVISION_REQUIRED: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-green-100 text-green-700',
};

const riskColors = {
  SAFE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  LOW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  MEDIUM: 'bg-orange-100 text-orange-700 border-orange-200',
  HIGH: 'bg-red-100 text-red-700 border-red-200',
};

export default function MyInternshipPage() {
  const [record, setRecord] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [reports, setReports] = useState([]);
  const [offer, setOffer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    weekNumber: '', workSummary: '', skillsUsed: '', learningOutcomes: '',
    challenges: '', achievements: '', nextWeekGoals: '', attendanceDays: 5, progressPercent: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiWarning, setAiWarning] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordRes, offerRes] = await Promise.all([
        api.get('/internship-records/my').catch(() => ({ data: { data: null } })),
        api.get('/offers/my').catch(() => ({ data: { data: null } })),
      ]);
      setRecord(recordRes.data.data);
      setOffer(offerRes.data.data);

      if (recordRes.data.data) {
        const [msRes, rpRes] = await Promise.all([
          api.get(`/internship-records/${recordRes.data.data._id}/milestones`),
          api.get(`/weekly-reports?internshipRecordId=${recordRes.data.data._id}`),
        ]);
        setMilestones(msRes.data.data || []);
        setReports(rpRes.data.data || []);
        setReportForm(f => ({ ...f, weekNumber: (rpRes.data.data?.length || 0) + 1 }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRespondOffer = async (status) => {
    await api.patch(`/offers/${offer._id}/respond`, { status });
    fetchData();
  };

  const handleSubmitReport = async (asDraft = false) => {
    try {
      setSubmitting(true);
      setAiWarning(null);
      const payload = {
        ...reportForm,
        internshipRecordId: record._id,
        skillsUsed: reportForm.skillsUsed.split(',').map(s => s.trim()).filter(Boolean),
      };
      const endpoint = asDraft ? '/weekly-reports/draft' : '/weekly-reports';
      const res = await api.post(endpoint, payload);
      if (res.data.confidentialityWarning) {
        setAiWarning(res.data.confidentialityWarning);
      }
      setShowReportForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const overallProgress = milestones.length > 0
    ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  // No active internship — show offer or empty state
  if (!record) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Internship</h1>
        {offer ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">🎉</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">You have an offer!</h2>
                <p className="text-gray-500 text-sm">Review and respond to your internship offer</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
              <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium">{offer.internshipId?.title}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Company</span><span className="font-medium">{offer.companyId?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Stipend</span><span className="font-medium">₹{offer.stipend?.toLocaleString()}/month</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">{offer.duration}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{offer.location || 'Remote'}</span></div>
              {offer.joiningDate && <div className="flex justify-between"><span className="text-gray-500">Joining Date</span><span className="font-medium">{new Date(offer.joiningDate).toLocaleDateString()}</span></div>}
            </div>
            {offer.additionalNote && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-700">
                <strong>Note from recruiter:</strong> {offer.additionalNote}
              </div>
            )}
            {offer.status === 'PENDING' ? (
              <div className="flex gap-3">
                <button onClick={() => handleRespondOffer('ACCEPTED')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors">
                  ✓ Accept Offer
                </button>
                <button onClick={() => handleRespondOffer('DECLINED')}
                  className="flex-1 bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors">
                  ✕ Decline
                </button>
              </div>
            ) : (
              <div className={`text-center py-3 rounded-xl font-medium ${offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Offer {offer.status === 'ACCEPTED' ? 'Accepted ✓' : 'Declined'}
                {offer.status === 'ACCEPTED' && <p className="text-sm font-normal mt-1">Awaiting college TPO approval…</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Internship</h2>
            <p className="text-gray-500">Apply to internships to get started. Your offer will appear here once a recruiter selects you.</p>
          </div>
        )}
      </div>
    );
  }

  const tabs = ['overview', 'milestones', 'reports'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{record.internshipId?.title}</h1>
            <p className="text-indigo-100">{record.companyId?.name} • {record.internshipId?.location || 'Remote'}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${record.status === 'ACTIVE' ? 'bg-green-400/20 text-green-100 border border-green-400/30' : 'bg-white/20 text-white'}`}>
            {record.status}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div><p className="text-indigo-200 text-xs uppercase tracking-wide">Started</p><p className="font-semibold text-sm">{new Date(record.startDate).toLocaleDateString()}</p></div>
          <div><p className="text-indigo-200 text-xs uppercase tracking-wide">Ends</p><p className="font-semibold text-sm">{new Date(record.endDate).toLocaleDateString()}</p></div>
          <div><p className="text-indigo-200 text-xs uppercase tracking-wide">Progress</p><p className="font-semibold text-sm">{overallProgress}%</p></div>
        </div>
        <div className="mt-3 bg-white/20 rounded-full h-2">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${overallProgress}%` }}></div>
        </div>
      </div>

      {/* AI Warning */}
      {aiWarning && aiWarning.riskLevel !== 'SAFE' && (
        <div className={`border rounded-xl p-4 ${riskColors[aiWarning.riskLevel]}`}>
          <div className="flex items-center gap-2 font-semibold mb-2">
            ⚠️ AI Confidentiality Warning — Risk Level: {aiWarning.riskLevel}
          </div>
          {aiWarning.flaggedCategories?.length > 0 && (
            <p className="text-sm mb-1"><strong>Flagged:</strong> {aiWarning.flaggedCategories.join(', ')}</p>
          )}
          {aiWarning.suggestion && <p className="text-sm">{aiWarning.suggestion}</p>}
          <button onClick={() => setAiWarning(null)} className="text-xs underline mt-2">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${activeTab === t ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">College Mentor</p>
                  <p className="font-medium">{record.collegeMentorId?.name || 'Not assigned'}</p>
                  <p className="text-sm text-gray-500">{record.collegeMentorId?.email || ''}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Company Mentor</p>
                  <p className="font-medium">{record.companyMentorId?.name || 'Not assigned'}</p>
                  <p className="text-sm text-gray-500">{record.companyMentorId?.email || ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center bg-blue-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Reports Submitted</p>
                </div>
                <div className="text-center bg-green-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'VERIFIED').length}</p>
                  <p className="text-xs text-gray-500 mt-1">Verified</p>
                </div>
                <div className="text-center bg-purple-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-purple-600">{milestones.filter(m => m.status === 'COMPLETED').length}/{milestones.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Milestones Done</p>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-3">
              {milestones.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>No milestones set yet. Your company mentor will add them.</p>
                </div>
              ) : milestones.map(m => (
                <div key={m._id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{m.title}</h3>
                      {m.description && <p className="text-sm text-gray-500 mt-1">{m.description}</p>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      m.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>{m.status.replace('_', ' ')}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 mt-3">
                    <div className="bg-indigo-500 rounded-full h-2 transition-all" style={{ width: `${m.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{m.progress}% complete{m.dueDate ? ` • Due ${new Date(m.dueDate).toLocaleDateString()}` : ''}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Weekly Reports</h3>
                <button onClick={() => setShowReportForm(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  + New Report
                </button>
              </div>

              {showReportForm && (
                <div className="border-2 border-indigo-200 rounded-xl p-5 bg-indigo-50 space-y-4">
                  <h4 className="font-semibold text-gray-900">Week {reportForm.weekNumber} Report</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Summary *</label>
                    <textarea rows={3} value={reportForm.workSummary}
                      onChange={e => setReportForm(f => ({ ...f, workSummary: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none resize-none"
                      placeholder="What did you work on this week? (Keep it high-level — no confidential details)" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills Used</label>
                      <input type="text" value={reportForm.skillsUsed}
                        onChange={e => setReportForm(f => ({ ...f, skillsUsed: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                        placeholder="React, Python, SQL (comma separated)" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attendance (days)</label>
                      <input type="number" min={0} max={7} value={reportForm.attendanceDays}
                        onChange={e => setReportForm(f => ({ ...f, attendanceDays: +e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcomes</label>
                    <textarea rows={2} value={reportForm.learningOutcomes}
                      onChange={e => setReportForm(f => ({ ...f, learningOutcomes: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
                      <textarea rows={2} value={reportForm.challenges}
                        onChange={e => setReportForm(f => ({ ...f, challenges: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
                      <textarea rows={2} value={reportForm.achievements}
                        onChange={e => setReportForm(f => ({ ...f, achievements: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Week Goals</label>
                    <textarea rows={2} value={reportForm.nextWeekGoals}
                      onChange={e => setReportForm(f => ({ ...f, nextWeekGoals: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress this week (%)</label>
                    <input type="range" min={0} max={100} value={reportForm.progressPercent}
                      onChange={e => setReportForm(f => ({ ...f, progressPercent: +e.target.value }))}
                      className="w-full accent-indigo-600" />
                    <p className="text-xs text-gray-500 mt-1">{reportForm.progressPercent}%</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                    🛡️ <strong>AI Confidentiality Check</strong> will run on submit. Do not include API keys, passwords, client data, or proprietary code.
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleSubmitReport(false)} disabled={submitting}
                      className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                      {submitting ? 'Checking…' : '🛡️ Submit (AI Check)'}
                    </button>
                    <button onClick={() => handleSubmitReport(true)} disabled={submitting}
                      className="px-4 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors">
                      Save Draft
                    </button>
                    <button onClick={() => setShowReportForm(false)}
                      className="px-4 text-gray-500 py-2.5 text-sm hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {reports.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No reports yet. Submit your first weekly report.</p>
                </div>
              ) : reports.map(r => (
                <div key={r._id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Week {r.weekNumber}</p>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{r.workSummary}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ml-3 shrink-0 ${statusColors[r.status]}`}>{r.status.replace('_', ' ')}</span>
                  </div>
                  {r.mentorComment && (
                    <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
                      <strong>Mentor:</strong> {r.mentorComment}
                    </div>
                  )}
                  {r.confidentialityCheck?.riskLevel && r.confidentialityCheck.riskLevel !== 'SAFE' && !r.confidentialityCheck.skipped && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded border ${riskColors[r.confidentialityCheck.riskLevel]}`}>
                      ⚠️ AI Risk: {r.confidentialityCheck.riskLevel}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'Draft'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
