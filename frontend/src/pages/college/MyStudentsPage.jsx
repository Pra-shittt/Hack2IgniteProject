import { useState, useEffect } from 'react';
import api from '../../services/api';

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
    // Find this student's submission
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

  const warningColors = {
    ON_TRACK: 'bg-green-100 text-green-700',
    NEEDS_ATTENTION: 'bg-amber-100 text-amber-700',
    AT_RISK: 'bg-red-100 text-red-700',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="flex gap-6">
      {/* Student List */}
      <div className="w-72 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">My Students</h2>
          <p className="text-xs text-gray-500 mt-0.5">{records.length} assigned</p>
        </div>
        <div className="divide-y divide-gray-100">
          {records.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-400">
              <div className="text-4xl mb-2">👤</div>
              <p className="text-sm">No students assigned yet.</p>
            </div>
          ) : records.map(r => (
            <div key={r._id}
              onClick={() => selectStudent(r)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?._id === r._id ? 'bg-indigo-50' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center font-semibold text-purple-600 text-sm shrink-0">
                {r.studentId?.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{r.studentId?.name}</p>
                <p className="text-xs text-gray-500 truncate">{r.internshipId?.title}</p>
                {r.warningStatus && (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium mt-1 inline-block ${warningColors[r.warningStatus]}`}>
                    {r.warningStatus.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && detail ? (
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.studentId?.name}</h2>
                <p className="text-gray-500 text-sm">{selected.studentId?.email}</p>
                <p className="text-gray-600 text-sm mt-1">{selected.internshipId?.title} • {selected.companyId?.name}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${warningColors[detail.warningStatus] || 'bg-gray-100 text-gray-600'}`}>
                {detail.warningStatus?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-indigo-600">{detail.reports?.length || 0}</p>
                <p className="text-xs text-gray-500">Reports</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-600">{detail.reports?.filter(r => r.status === 'VERIFIED').length || 0}</p>
                <p className="text-xs text-gray-500">Verified</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-purple-600">
                  {detail.milestones?.filter(m => m.status === 'COMPLETED').length || 0}/{detail.milestones?.length || 0}
                </p>
                <p className="text-xs text-gray-500">Milestones</p>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Reports</h3>
            {detail.reports?.length === 0 ? (
              <p className="text-gray-400 text-sm">No reports yet.</p>
            ) : detail.reports.slice(-3).reverse().map(r => (
              <div key={r._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">Week {r.weekNumber}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{r.attendanceDays}/7 days</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                    r.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>{r.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Final Submission Review */}
          {submissions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Final Submission</h3>
                {submissions[0].status === 'COMPANY_EVALUATED' && (
                  <button onClick={() => setReviewModal(submissions[0])}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                    Write Review →
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{submissions[0].projectSummary}</p>
              <div className="flex flex-wrap gap-2">
                {submissions[0].skillsLearned?.map(s => (
                  <span key={s} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
              {submissions[0].collegeMentorReview?.recommendation && (
                <div className="mt-4 bg-purple-50 rounded-lg p-3 text-sm text-purple-700">
                  <strong>Your recommendation:</strong> {submissions[0].collegeMentorReview.recommendation}
                </div>
              )}
            </div>
          )}
        </div>
      ) : !selected ? (
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-5xl mb-3">👈</div>
            <p>Select a student to view details</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* College Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">College Mentor Review</h2>
              <p className="text-sm text-gray-500 mt-1">{selected?.studentId?.name}</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Recommendation *</label>
              <textarea rows={5} value={recommendation}
                onChange={e => setRecommendation(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-300 outline-none resize-none"
                placeholder="Write your recommendation for this student's internship completion..." />
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={handleCollegeReview} disabled={!recommendation.trim() || submitting}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors">
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
              <button onClick={() => setReviewModal(null)} className="px-5 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
