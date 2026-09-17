import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      {/* Left branding panel */}
      <div style={{
        width: '45%', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '48px', gap: '32px',
      }} className="hide-mobile">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <GraduationCap size={40} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>InternSphere</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: 300, lineHeight: 1.6 }}>
            The complete internship lifecycle platform — from discovery to digital certification.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 300 }}>
          {[
            { label: '🔍 Discover', desc: 'Browse & apply to internships' },
            { label: '🎯 Interview', desc: 'Integrated video workspace' },
            { label: '📊 Monitor', desc: 'AI-guarded progress tracking' },
            { label: '🏆 Complete', desc: 'Digital internship records' },
          ].map(({ label, desc }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', backdropFilter: 'blur(10px)' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: 2 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Sign in</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Don't have an account? <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, color: '#374151' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="login-email"
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  style={{ paddingLeft: 38 }}
                  placeholder="you@example.com"
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

          {/* Demo accounts hint */}
          <div style={{ marginTop: 32, padding: 16, background: '#ede9fe', borderRadius: 10, fontSize: '0.8rem', color: '#4338ca' }}>
            <strong>Demo Hint:</strong> Register with any role to get started. All 5 roles are supported.
          </div>
        </div>
      </div>
    </div>
  );
}
