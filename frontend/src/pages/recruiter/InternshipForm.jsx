import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InternshipForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsCompany, setNeedsCompany] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  useEffect(() => {
    api.get('/companies').then(res => setCompanies(res.data.data));

    if (!user.companyId) setNeedsCompany(true);

    if (isEdit) {
      api.get(`/internships/${id}`).then(res => {
        const i = res.data.data;
        reset({
          title: i.title,
          description: i.description,
          location: i.location,
          stipend: i.stipend,
          duration: i.duration,
          applicationDeadline: i.applicationDeadline?.split('T')[0],
          'eligibility.minCgpa': i.eligibility?.minCgpa,
          'eligibility.description': i.eligibility?.description,
          preparationTips: i.preparationTips?.join('\n'),
          technicalQuestions: i.technicalQuestions?.join('\n'),
          hrQuestions: i.hrQuestions?.join('\n'),
        });
        setSkills(i.skills || []);
      });
    }
  }, [id, isEdit, user.companyId]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        skills,
        stipend: data.stipend ? Number(data.stipend) : undefined,
        eligibility: {
          minCgpa: data['eligibility.minCgpa'] ? Number(data['eligibility.minCgpa']) : undefined,
          description: data['eligibility.description'],
        },
        preparationTips: data.preparationTips ? data.preparationTips.split('\n').filter(Boolean) : [],
        technicalQuestions: data.technicalQuestions ? data.technicalQuestions.split('\n').filter(Boolean) : [],
        hrQuestions: data.hrQuestions ? data.hrQuestions.split('\n').filter(Boolean) : [],
      };
      delete payload['eligibility.minCgpa'];
      delete payload['eligibility.description'];

      if (isEdit) {
        await api.patch(`/internships/${id}`, payload);
        toast.success('Internship updated!');
      } else {
        await api.post('/internships', payload);
        toast.success('Internship posted!');
      }
      navigate('/my-internships');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save internship');
    } finally {
      setLoading(false);
    }
  };

  // Need to create/join company first
  if (needsCompany && !isEdit) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 12 }}>Company Setup Required</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>Before posting internships, you need to be associated with a company.</p>
          <CompanyQuickCreate onCreated={() => setNeedsCompany(false)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div className="card">
        <h1 className="page-title" style={{ marginBottom: 24 }}>{isEdit ? 'Edit Internship' : 'Post New Internship'}</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic */}
            <Section title="Basic Information">
              <FormField label="Internship Title *" error={errors.title?.message}>
                <input className={`input ${errors.title ? 'input-error' : ''}`} placeholder="e.g. Frontend Developer Intern" {...register('title', { required: 'Title is required' })} />
              </FormField>
              <FormField label="Description *" error={errors.description?.message}>
                <textarea className={`input ${errors.description ? 'input-error' : ''}`} rows={5} placeholder="Describe the role, responsibilities, and what interns will learn..." style={{ resize: 'vertical', fontFamily: 'inherit' }} {...register('description', { required: 'Description is required' })} />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Location">
                  <input className="input" placeholder="e.g. Mumbai / Remote" {...register('location')} />
                </FormField>
                <FormField label="Stipend (₹/month)">
                  <input className="input" type="number" placeholder="e.g. 15000" {...register('stipend')} />
                </FormField>
                <FormField label="Duration">
                  <input className="input" placeholder="e.g. 2 months" {...register('duration')} />
                </FormField>
                <FormField label="Application Deadline">
                  <input className="input" type="date" {...register('applicationDeadline')} />
                </FormField>
              </div>
            </Section>

            {/* Skills */}
            <Section title="Required Skills">
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input className="input" placeholder="Add a skill (e.g. React)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}><Plus size={16} /></button>
              </div>
              {skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {skills.map(s => (
                    <span key={s} className="badge badge-indigo" style={{ gap: 6 }}>
                      {s}
                      <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </Section>

            {/* Eligibility */}
            <Section title="Eligibility">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Minimum CGPA">
                  <input className="input" type="number" step="0.1" min="0" max="10" placeholder="e.g. 7.5" {...register('eligibility.minCgpa')} />
                </FormField>
                <FormField label="Eligibility Description">
                  <input className="input" placeholder="Any other criteria..." {...register('eligibility.description')} />
                </FormField>
              </div>
            </Section>

            {/* Preparation */}
            <Section title="Preparation Hub Content (Optional)">
              <FormField label="Technical Questions (one per line)">
                <textarea className="input" rows={4} placeholder="What is React? ..." style={{ resize: 'vertical', fontFamily: 'inherit' }} {...register('technicalQuestions')} />
              </FormField>
              <FormField label="HR Questions (one per line)">
                <textarea className="input" rows={3} placeholder="Tell me about yourself..." style={{ resize: 'vertical', fontFamily: 'inherit' }} {...register('hrQuestions')} />
              </FormField>
              <FormField label="Preparation Tips (one per line)">
                <textarea className="input" rows={3} placeholder="Study React hooks..." style={{ resize: 'vertical', fontFamily: 'inherit' }} {...register('preparationTips')} />
              </FormField>
            </Section>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : (isEdit ? 'Save Changes' : 'Post Internship')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#374151', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: 6, color: '#374151' }}>{label}</label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function CompanyQuickCreate({ onCreated }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/companies', data);
      toast.success('Company created! Please reload the page.');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <input className="input" placeholder="Company name *" {...register('name', { required: true })} />
      <input className="input" placeholder="Industry (e.g. Technology)" {...register('industry')} />
      <input className="input" placeholder="Location" {...register('location')} />
      <input className="input" placeholder="Website" {...register('website')} />
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Company & Continue'}</button>
    </form>
  );
}
