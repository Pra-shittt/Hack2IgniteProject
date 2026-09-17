import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function FinalSubmissionPage() {
  const [record, setRecord] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    projectSummary: '',
    skillsLearned: '',
    finalReportUrl: '',
    presentationUrl: '',
    certificateUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordRes, subRes] = await Promise.all([
        api.get('/internship-records/my').catch(() => ({ data: { data: null } })),
        api.get('/final-submissions/my').catch(() => ({ data: { data: null } })),
      ]);
      setRecord(recordRes.data.data);
      setSubmission(subRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await api.post('/final-submissions', {
        internshipRecordId: record._id,
        projectSummary: form.projectSummary,
        skillsLearned: form.skillsLearned.split(',').map(s => s.trim()).filter(Boolean),
        finalReportUrl: form.finalReportUrl || undefined,
        presentationUrl: form.presentationUrl || undefined,
        certificateUrl: form.certificateUrl || undefined,
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const statusSteps = [
    { key: 'SUBMITTED', label: 'Submitted', icon: '📤' },
    { key: 'COMPANY_EVALUATED', label: 'Company Evaluated', icon: '🏢' },
    { key: 'COLLEGE_REVIEWED', label: 'College Reviewed', icon: '🎓' },
    { key: 'TPO_APPROVED', label: 'TPO Approved', icon: '✅' },
    { key: 'COMPLETED', label: 'Completed', icon: '🏆' },
  ];

  const currentStepIndex = submission
    ? statusSteps.findIndex(s => s.key === submission.status)
    : -1;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!record) return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🎓</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Internship</h2>
      <p className="text-gray-500">You need an active internship to submit final work.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Final Submission</h1>
        <p className="text-gray-500 mt-1">Submit your final internship work for evaluation and completion.</p>
      </div>

      {/* Progress Steps */}
      {submission && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Completion Progress</h2>
          <div className="flex items-center gap-0">
            {statusSteps.map((step, idx) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${
                    idx <= currentStepIndex ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {idx <= currentStepIndex ? '✓' : step.icon}
                  </div>
                  <p className={`text-xs mt-1 text-center max-w-[70px] ${idx <= currentStepIndex ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-5 ${idx < currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Evaluation */}
      {submission?.companyEvaluation?.overallRating && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🏢 Company Evaluation</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Participation', submission.companyEvaluation.participation],
              ['Professionalism', submission.companyEvaluation.professionalism],
              ['Technical Learning', submission.companyEvaluation.technicalLearning],
              ['Communication', submission.companyEvaluation.communication],
            ].map(([label, rating]) => (
              <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-lg ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {submission.companyEvaluation.feedback && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
              <strong>Feedback:</strong> {submission.companyEvaluation.feedback}
            </div>
          )}
        </div>
      )}

      {/* College Mentor Review */}
      {submission?.collegeMentorReview?.recommendation && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-3">🎓 College Mentor Review</h2>
          <p className="text-gray-700">{submission.collegeMentorReview.recommendation}</p>
        </div>
      )}

      {/* TPO Approval */}
      {submission?.tpoApproval?.status && (
        <div className={`rounded-2xl border shadow-sm p-6 ${submission.tpoApproval.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <h2 className="font-semibold mb-2">
            {submission.tpoApproval.status === 'APPROVED' ? '✅ TPO Approved — Internship Complete!' : '⚠️ TPO: Correction Required'}
          </h2>
          {submission.tpoApproval.remarks && <p className="text-sm text-gray-700">{submission.tpoApproval.remarks}</p>}
        </div>
      )}

      {/* Submit Form */}
      {!submission ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Submit Final Work</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Summary *</label>
              <textarea rows={4} required value={form.projectSummary}
                onChange={e => setForm(f => ({ ...f, projectSummary: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none resize-none"
                placeholder="Summarize what you worked on, key contributions, and outcomes..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills Learned *</label>
              <input type="text" required value={form.skillsLearned}
                onChange={e => setForm(f => ({ ...f, skillsLearned: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
                placeholder="React, Node.js, MongoDB, REST APIs... (comma separated)" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Final Report URL <span className="text-gray-400">(optional)</span></label>
                <input type="url" value={form.finalReportUrl}
                  onChange={e => setForm(f => ({ ...f, finalReportUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="https://drive.google.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Presentation URL <span className="text-gray-400">(optional)</span></label>
                <input type="url" value={form.presentationUrl}
                  onChange={e => setForm(f => ({ ...f, presentationUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="https://slides.google.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Certificate URL <span className="text-gray-400">(optional)</span></label>
                <input type="url" value={form.certificateUrl}
                  onChange={e => setForm(f => ({ ...f, certificateUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                  placeholder="https://..." />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Submitting…' : '📤 Submit Final Work'}
            </button>
          </form>
        </div>
      ) : submission.status !== 'COMPLETED' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Your Submission</h2>
          <p className="text-sm text-gray-600 mb-3">{submission.projectSummary}</p>
          <div className="flex flex-wrap gap-2">
            {submission.skillsLearned?.map(s => (
              <span key={s} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{s}</span>
            ))}
          </div>
          {submission.finalReportUrl && (
            <a href={submission.finalReportUrl} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-indigo-600 underline">View Final Report →</a>
          )}
        </div>
      )}
    </div>
  );
}
