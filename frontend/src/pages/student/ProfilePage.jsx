import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Upload, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState(profile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    reset({
      name: user?.name,
      phone: user?.phone,
      college: profile?.college,
      department: profile?.department,
      year: profile?.year,
      enrollmentNumber: profile?.enrollmentNumber,
      cgpa: profile?.cgpa,
      bio: profile?.bio,
    });
    setSkills(profile?.skills || []);
  }, [user, profile]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.patch('/users/profile', { ...data, skills });
      await refreshProfile();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      await api.post('/users/profile/resume', fd);
      await refreshProfile();
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Keep your profile updated for better opportunities</p>
        </div>
      </div>

      {/* Avatar + Resume */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>{user?.name?.charAt(0)?.toUpperCase()}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 2 }}>{user?.name}</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 8 }}>{user?.email}</div>
          <span className={`badge ${
            user?.role === 'STUDENT' ? 'badge-indigo' :
            user?.role === 'RECRUITER' ? 'badge-warning' :
            'badge-purple'
          }`}>{user?.role?.replace('_', ' ')}</span>
        </div>
        {user?.role === 'STUDENT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {profile?.resumeUrl ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View Resume</a>
                <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                  {uploading ? 'Uploading...' : 'Replace'} <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
                </label>
              </div>
            ) : (
              <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Resume'}
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
              </label>
            )}
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>PDF, DOC, DOCX (max 10MB)</div>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Personal */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Full Name</label>
                <input className="input" {...register('name')} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Phone Number</label>
                <input className="input" placeholder="+91 9999999999" {...register('phone')} />
              </div>
            </div>
          </div>

          {/* Academic — only for students */}
          {user?.role === 'STUDENT' && (
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>Academic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>College/University</label>
                  <input className="input" placeholder="e.g. IIT Bombay" {...register('college')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Department/Branch</label>
                  <input className="input" placeholder="e.g. Computer Science" {...register('department')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Year of Study</label>
                  <select className="input" {...register('year')}>
                    <option value="">Select year</option>
                    {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Enrollment Number</label>
                  <input className="input" placeholder="e.g. CS2021001" {...register('enrollmentNumber')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>CGPA</label>
                  <input className="input" type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.5" {...register('cgpa')} />
                </div>
              </div>

              {/* Bio */}
              <div style={{ marginTop: 14 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6 }}>Bio</label>
                <textarea className="input" rows={3} placeholder="A brief introduction about yourself..." style={{ resize: 'vertical', fontFamily: 'inherit' }} {...register('bio')} />
              </div>

              {/* Skills */}
              <div style={{ marginTop: 14 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 8 }}>Skills</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input className="input" placeholder="Add skill (e.g. Python)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}><Plus size={16} /></button>
                </div>
                {skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {skills.map(s => (
                      <span key={s} className="badge badge-indigo" style={{ gap: 6 }}>
                        {s}
                        <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
