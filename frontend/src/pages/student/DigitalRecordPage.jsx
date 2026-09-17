import { useState, useEffect } from 'react';
import api from '../../services/api';

const outcomeConfig = {
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: '🏆' },
  PPO: { label: 'Pre-Placement Offer', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '⭐' },
  EXTENDED: { label: 'Extended', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📅' },
  NO_OFFER: { label: 'No Offer', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: '📋' },
};

export default function DigitalRecordPage() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/digital-record/my')
      .then(res => setRecord(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!record || !record.internshipRecord) return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">📜</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No Internship Record Yet</h2>
      <p className="text-gray-500">Your digital internship record will appear here once you complete your internship.</p>
    </div>
  );

  const { internshipRecord, finalSubmission, stats, learningJourney, evaluation, outcome } = record;
  const durationDays = internshipRecord.startDate && internshipRecord.endDate
    ? Math.round((new Date(internshipRecord.endDate) - new Date(internshipRecord.startDate)) / (1000 * 60 * 60 * 24))
    : null;
  const durationWeeks = durationDays ? Math.round(durationDays / 7) : null;
  const outcomeInfo = outcome ? outcomeConfig[outcome] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-indigo-200 text-sm font-medium uppercase tracking-widest mb-1">Digital Internship Record</p>
              <h1 className="text-3xl font-bold mb-1">{record.role}</h1>
              <p className="text-indigo-200 text-lg">{record.company?.name}</p>
            </div>
            {outcomeInfo && (
              <div className={`px-4 py-2 rounded-xl border font-semibold text-sm flex items-center gap-2 ${outcomeInfo.color}`}>
                {outcomeInfo.icon} {outcomeInfo.label}
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-indigo-300 text-xs uppercase tracking-wide">From</p>
              <p className="font-semibold text-sm">{internshipRecord.startDate ? new Date(internshipRecord.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-xs uppercase tracking-wide">To</p>
              <p className="font-semibold text-sm">{internshipRecord.endDate ? new Date(internshipRecord.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-xs uppercase tracking-wide">Duration</p>
              <p className="font-semibold text-sm">{durationWeeks ? `${durationWeeks} weeks` : '—'}</p>
            </div>
            <div>
              <p className="text-indigo-300 text-xs uppercase tracking-wide">Status</p>
              <p className="font-semibold text-sm">{internshipRecord.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Reports Verified', value: stats?.totalReports ?? '—', icon: '📝', color: 'text-blue-600 bg-blue-50' },
          { label: 'Milestones', value: stats ? `${stats.milestonesCompleted}/${stats.totalMilestones}` : '—', icon: '🎯', color: 'text-purple-600 bg-purple-50' },
          { label: 'Attendance', value: stats?.attendancePercent != null ? `${stats.attendancePercent}%` : '—', icon: '📅', color: 'text-green-600 bg-green-50' },
          { label: 'Skills Gained', value: learningJourney?.length ?? '—', icon: '⚡', color: 'text-indigo-600 bg-indigo-50' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-5 ${card.color}`}>
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs font-medium mt-1 opacity-70">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Skills & Learning Journey */}
      {learningJourney?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">⚡ Learning Journey</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {(finalSubmission?.skillsLearned || record.skills || []).map(skill => (
              <span key={skill} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
                {skill}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 font-medium mb-2">Skills by usage across weekly reports:</p>
            {learningJourney.slice(0, 8).map(({ skill, weeksUsed }) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-28 truncate">{skill}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-500 rounded-full h-2 transition-all"
                    style={{ width: `${Math.min((weeksUsed / (learningJourney[0]?.weeksUsed || 1)) * 100, 100)}%` }}>
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-16">{weeksUsed} {weeksUsed === 1 ? 'week' : 'weeks'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Evaluation */}
      {evaluation?.overallRating && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">🏢 Company Evaluation</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              ['Participation', evaluation.participation],
              ['Professionalism', evaluation.professionalism],
              ['Technical Learning', evaluation.technicalLearning],
              ['Communication', evaluation.communication],
            ].map(([label, rating]) => (
              <div key={label} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-base ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-500">{evaluation.overallRating}</div>
              <div className="text-xs text-amber-600 font-medium">out of 5</div>
            </div>
            <div className="flex-1">
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-2xl ${s <= evaluation.overallRating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                ))}
              </div>
              <p className="text-sm text-amber-700">Overall Internship Rating</p>
            </div>
          </div>
          {evaluation.feedback && (
            <div className="mt-4 bg-blue-50 rounded-xl p-4 text-sm text-gray-700 border border-blue-100">
              <strong>Feedback from Company:</strong> {evaluation.feedback}
            </div>
          )}
        </div>
      )}

      {/* Final Submission Documents */}
      {finalSubmission && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">📄 Documents</h2>
          <div className="space-y-2">
            {[
              { label: 'Final Report', url: finalSubmission.finalReportUrl },
              { label: 'Presentation', url: finalSubmission.presentationUrl },
              { label: 'Company Certificate', url: finalSubmission.certificateUrl },
            ].filter(d => d.url).map(d => (
              <a key={d.label} href={d.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-colors group">
                <span className="text-xl">📎</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">{d.label}</span>
                <span className="ml-auto text-indigo-400 text-sm">View →</span>
              </a>
            ))}
            {!finalSubmission.finalReportUrl && !finalSubmission.presentationUrl && !finalSubmission.certificateUrl && (
              <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Mentor Info */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 text-lg mb-4">👥 Mentors</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">College Mentor</p>
            <p className="font-medium text-gray-900">{internshipRecord.collegeMentorId?.name || 'Not assigned'}</p>
            <p className="text-sm text-gray-500">{internshipRecord.collegeMentorId?.email || ''}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Company Mentor</p>
            <p className="font-medium text-gray-900">{internshipRecord.companyMentorId?.name || 'Not assigned'}</p>
            <p className="text-sm text-gray-500">{internshipRecord.companyMentorId?.email || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
