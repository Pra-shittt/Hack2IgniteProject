import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_PERSONAS = [
  { role: 'Student (Active)', name: 'Aarav Sharma', email: 'student@demo.com', color: '#4f46e5', icon: '👨‍🎓' },
  { role: 'Student (Completed)', name: 'Priya Patel', email: 'student2@demo.com', color: '#059669', icon: '👩‍🎓' },
  { role: 'Recruiter', name: 'Pooja Verma', email: 'recruiter@demo.com', color: '#2563eb', icon: '💼' },
  { role: 'College TPO', name: 'Dr. Rajesh Kulkarni', email: 'tpo@demo.com', color: '#d97706', icon: '🏛️' },
  { role: 'College Mentor', name: 'Prof. Sunita Patil', email: 'college.mentor@demo.com', color: '#7c3aed', icon: '🎓' },
  { role: 'Company Mentor', name: 'Vikram Malhotra', email: 'company.mentor@demo.com', color: '#0891b2', icon: '🏢' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const handleQuickLogin = async (email) => {
    setValue('email', email);
    setValue('password', 'Password123!');
    setLoading(true);
    try {
      const user = await login(email, 'Password123!');
      toast.success(`Welcome, ${user.name}! (${user.role})`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Try manual sign in or check server.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      {/* Left branding panel */}
      <div style={{
        width: '42%', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '48px', gap: '28px',
      }} className="hide-mobile">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <GraduationCap size={38} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>InternSphere</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.92rem', maxWidth: 320, lineHeight: 1.5 }}>
            National Internship Ecosystem connecting Students, Recruiters, TPO Administration, and Mentors.
          </p>
        </div>

        {/* Demo Personas for Quick Switch during Hackathon Evaluation */}
        <div style={{ width: '100%', maxWidth: 360, background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, textAlign: 'center' }}>
            ⚡ 1-Click Judge Demo Switcher
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_PERSONAS.map(p => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleQuickLogin(p.email)}
                disabled={loading}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '8px 10px',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.65rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Sign In</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Access your role workspace or <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>create a new account</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, color: '#374151' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="login-email"
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  style={{ paddingLeft: 38 }}
                  placeholder="student@demo.com"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, color: '#374151' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  style={{ paddingLeft: 38, paddingRight: 44 }}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 4 }}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Sign In'}
            </button>
          </form>

          {/* Quick login pill buttons for mobile view */}
          <div style={{ marginTop: 24, padding: 16, background: '#f1f5f9', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
              Quick Demo Logins (Password: Password123!)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DEMO_PERSONAS.map(p => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleQuickLogin(p.email)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 9999,
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {p.icon} {p.name.split(' ')[0]} ({p.role.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
