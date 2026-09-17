import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function FinalEvaluationPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    participation: 3, professionalism: 3, technicalLearning: 3, communication: 3, overallRating: 3, feedback: '',
  });
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

  const handleEvaluate = async () => {
    try {
      setSubmitting(true);
      await api.patch(`/final-submissions/${selected._id}/evaluate`, form);
      setSelected(null);
      fetchSubmissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const RatingInput = ({ label, field }) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm text-gray-700">{label}</label>
        <span className="text-amber-500 font-bold">{'★'.repeat(form[field])}{'☆'.repeat(5 - form[field])}</span>
      </div>
      <input type="range" min={1} max={5} value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: +e.target.value }))}
        className="w-full accent-amber-500" />
      <div className="flex justify-between text-xs text-gray-400">
        <span>Poor</span><span>Excellent</span>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Final Evaluations</h1>
        <p className="text-gray-500 mt-1">Evaluate interns who have completed and submitted their final work.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {submissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📊</div>
            <p>No final submissions to evaluate yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Intern', 'Project Summary', 'Skills', 'Submitted', 'Evaluation', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
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
                  <td className="px-5 py-4 max-w-[180px]">
                    <p className="text-sm text-gray-600 line-clamp-2">{s.projectSummary}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {s.skillsLearned?.slice(0, 3).map(sk => (
                        <span key={sk} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{sk}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(s.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    {s.companyEvaluation?.overallRating ? (
                      <span className="text-amber-500 font-bold text-lg">{s.companyEvaluation.overallRating}★</span>
                    ) : <span className="text-gray-400 text-sm">Not evaluated</span>}
                  </td>
                  <td className="px-5 py-4">
                    {s.status === 'SUBMITTED' ? (
                      <button onClick={() => { setSelected(s); setForm({ participation: 3, professionalism: 3, technicalLearning: 3, communication: 3, overallRating: 3, feedback: '' }); }}
                        className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                        Evaluate →
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">{s.status.replace('_', ' ')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Evaluation Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Evaluate — {selected.studentId?.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Rate on a scale of 1 (Poor) to 5 (Excellent)</p>
            </div>
            <div className="p-6 space-y-5">
              <RatingInput label="Participation & Engagement" field="participation" />
              <RatingInput label="Professionalism" field="professionalism" />
              <RatingInput label="Technical Learning" field="technicalLearning" />
              <RatingInput label="Communication" field="communication" />
              <RatingInput label="Overall Rating" field="overallRating" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback <span className="text-gray-400">(optional)</span></label>
                <textarea rows={4} value={form.feedback}
                  onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
                  placeholder="Overall feedback for the intern..." />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={handleEvaluate} disabled={submitting}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {submitting ? 'Submitting…' : '📊 Submit Evaluation'}
              </button>
              <button onClick={() => setSelected(null)} className="px-5 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
