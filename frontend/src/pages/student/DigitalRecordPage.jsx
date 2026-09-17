import { useState, useEffect } from 'react';
import api from '../../services/api';

const outcomeConfig = {
  COMPLETED: { label: 'Completed', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', icon: '🏆' },
  PPO: { label: 'Pre-Placement Offer (PPO)', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', icon: '⭐' },
  EXTENDED: { label: 'Internship Extended', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '📅' },
  NO_OFFER: { label: 'Completed (No Offer)', bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb', icon: '📋' },
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid #e0e7ff',
          borderTopColor: '#4f46e5',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!record || !record.internshipRecord) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>📜</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>No Digital Record Yet</h2>
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Your verified digital internship record and completion credentials will be compiled here once you finish your internship.</p>
      </div>
    );
  }

  const { internshipRecord, finalSubmission, stats, learningJourney, evaluation, outcome } = record;
  const durationDays = internshipRecord.startDate && internshipRecord.endDate
    ? Math.round((new Date(internshipRecord.endDate) - new Date(internshipRecord.startDate)) / (1000 * 60 * 60 * 24))
    : null;
  const durationWeeks = durationDays ? Math.round(durationDays / 7) : null;
  const outcomeInfo = outcome ? outcomeConfig[outcome] : null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3.5rem' }}>
      {/* Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%)',
        borderRadius: '1.25rem',
        padding: '2.25rem',
        color: '#ffffff',
        position: 'relative',
        boxShadow: '0 12px 28px -6px rgba(55, 48, 163, 0.35)',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: 'rgba(255,255,255,0.18)',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              marginBottom: '0.75rem'
            }}>
              Official Verified Digital Record
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.4rem 0', lineHeight: 1.2 }}>{record.role || 'Intern'}</h1>
            <p style={{ fontSize: '1.15rem', color: '#c7d2fe', margin: 0, fontWeight: 500 }}>{record.company?.name || 'Partner Company'}</p>
          </div>

          {outcomeInfo && (
            <div style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '0.85rem',
              background: outcomeInfo.bg,
              color: outcomeInfo.color,
              border: `1px solid ${outcomeInfo.border}`,
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
            }}>
              <span>{outcomeInfo.icon}</span>
              <span>{outcomeInfo.label}</span>
            </div>
          )}
        </div>

        {/* Date / Duration / Status Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          background: 'rgba(0, 0, 0, 0.15)',
          padding: '1.25rem',
          borderRadius: '0.85rem'
        }}>
          <div>
            <p style={{ color: '#c7d2fe', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0', fontWeight: 600 }}>Start Date</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              {internshipRecord.startDate ? new Date(internshipRecord.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div>
            <p style={{ color: '#c7d2fe', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0', fontWeight: 600 }}>End Date</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              {internshipRecord.endDate ? new Date(internshipRecord.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div>
            <p style={{ color: '#c7d2fe', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0', fontWeight: 600 }}>Total Duration</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              {durationWeeks ? `${durationWeeks} Weeks` : durationDays ? `${durationDays} Days` : '—'}
            </p>
          </div>
          <div>
            <p style={{ color: '#c7d2fe', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0', fontWeight: 600 }}>Record Status</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#86efac' }}>
              {internshipRecord.status || 'ACTIVE'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        {[
          { label: 'Weekly Reports Verified', value: stats?.totalReports ?? '—', icon: '📝', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { label: 'Milestones Completed', value: stats ? `${stats.milestonesCompleted} / ${stats.totalMilestones}` : '—', icon: '🎯', bg: '#f5f3ff', border: '#ddd6fe', color: '#6d28d9' },
          { label: 'Attendance Recorded', value: stats?.attendancePercent != null ? `${stats.attendancePercent}%` : '100%', icon: '📅', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
          { label: 'Key Skills Tracked', value: learningJourney?.length || finalSubmission?.skillsLearned?.length || '—', icon: '⚡', bg: '#eef2ff', border: '#c7d2fe', color: '#4338ca' },
        ].map(card => (
          <div key={card.label} style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
            borderRadius: '1rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: card.color, lineHeight: 1.2 }}>{card.value}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginTop: '0.35rem' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills & Learning Journey */}
      {((finalSubmission?.skillsLearned && finalSubmission.skillsLearned.length > 0) || (learningJourney && learningJourney.length > 0)) && (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '1.75rem'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡</span> Skills & Competencies Verified
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {(finalSubmission?.skillsLearned || record.skills || []).map(skill => (
              <span key={skill} style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid #dbeafe'
              }}>
                {skill}
              </span>
            ))}
          </div>

          {learningJourney && learningJourney.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                Skill frequency across weekly progress submissions:
              </p>
              {learningJourney.slice(0, 8).map(({ skill, weeksUsed }) => {
                const maxWeeks = learningJourney[0]?.weeksUsed || 1;
                const percentage = Math.min((weeksUsed / maxWeeks) * 100, 100);
                return (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', width: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {skill}
                    </span>
                    <div style={{ flex: 1, background: '#f3f4f6', height: '8px', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: '#4f46e5', borderRadius: '9999px' }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', width: '70px', textAlign: 'right' }}>
                      {weeksUsed} {weeksUsed === 1 ? 'week' : 'weeks'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Company Evaluation */}
      {evaluation?.overallRating && (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '1.75rem'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏢</span> Final Company Evaluation
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            {[
              ['Participation', evaluation.participation],
              ['Professionalism', evaluation.professionalism],
              ['Technical Learning', evaluation.technicalLearning],
              ['Communication', evaluation.communication],
            ].map(([label, rating]) => (
              <div key={label} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f9fafb',
                border: '1px solid #f3f4f6',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 500 }}>{label}</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ fontSize: '1rem', color: s <= rating ? '#eab308' : '#e5e7eb' }}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: '1rem',
            padding: '1.25rem'
          }}>
            <div style={{ textAlign: 'center', paddingRight: '1rem', borderRight: '1px solid #fcd34d' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#b45309', lineHeight: 1 }}>{evaluation.overallRating}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e', marginTop: '0.25rem' }}>out of 5.0</div>
            </div>
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} style={{ fontSize: '1.35rem', color: s <= evaluation.overallRating ? '#f59e0b' : '#d1d5db' }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#78350f', fontWeight: 600, margin: 0 }}>Official Rating by Host Organization</p>
            </div>
          </div>

          {evaluation.feedback && (
            <div style={{
              marginTop: '1.25rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              fontSize: '0.9rem',
              color: '#1e3a8a',
              lineHeight: 1.5
            }}>
              <strong>Mentor Feedback & Observations:</strong> {evaluation.feedback}
            </div>
          )}
        </div>
      )}

      {/* Verified Artifacts & Documents */}
      {finalSubmission && (
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '1.75rem'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📄</span> Verified Deliverables & Credentials
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Final Project Report', url: finalSubmission.finalReportUrl, icon: '📑' },
              { label: 'Capstone Presentation', url: finalSubmission.presentationUrl, icon: '📊' },
              { label: 'Company Certificate of Completion', url: finalSubmission.certificateUrl, icon: '🏆' },
            ].filter(d => d.url).map(d => (
              <a
                key={d.label}
                href={d.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.85rem',
                  textDecoration: 'none',
                  background: '#f9fafb',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', margin: 0 }}>{d.label}</p>
                  <p style={{ fontSize: '0.75rem', color: '#4f46e5', margin: '0.2rem 0 0 0', fontWeight: 600 }}>Open Document ↗</p>
                </div>
              </a>
            ))}
            {!finalSubmission.finalReportUrl && !finalSubmission.presentationUrl && !finalSubmission.certificateUrl && (
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>No verified documents attached yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Mentors in Charge */}
      <div style={{
        background: '#ffffff',
        borderRadius: '1.25rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: '1.75rem'
      }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>👥</span> Assigned Advisory Committee
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#f9fafb', borderRadius: '0.85rem', padding: '1rem 1.25rem', border: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0', fontWeight: 700 }}>
              College Faculty Mentor
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.2rem 0' }}>
              {internshipRecord.collegeMentorId?.name || 'Prof. Faculty Mentor'}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
              {internshipRecord.collegeMentorId?.email || 'mentor@college.edu.in'}
            </p>
          </div>

          <div style={{ background: '#f9fafb', borderRadius: '0.85rem', padding: '1rem 1.25rem', border: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.35rem 0', fontWeight: 700 }}>
              Company Technical Mentor
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.2rem 0' }}>
              {internshipRecord.companyMentorId?.name || 'Industry Mentor'}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
              {internshipRecord.companyMentorId?.email || 'mentor@company.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
