import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'STUDENT', label: '🎓 Student', desc: 'Browse internships and track your journey' },
  { value: 'RECRUITER', label: '💼 Recruiter', desc: 'Post internships and hire candidates' },
  { value: 'COMPANY_MENTOR', label: '🏢 Company Mentor', desc: 'Supervise and evaluate interns' },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('STUDENT');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'STUDENT' } });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerUser({ ...data, role: selectedRole });
      toast.success(`Welcome to InternSphere, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, background: 'white', borderRadius: 16, padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>InternSphere</span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Create your account</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 28 }}>
          Already have one? <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>

        {/* Role selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 10, color: '#374151' }}>I am a...</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROLES.map((role) => (
              <label
                key={role.value}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  border: `2px solid ${selectedRole === role.value ? '#4f46e5' : '#e2e8f0'}`,
                  borderRadius: 10, cursor: 'pointer',
                  background: selectedRole === role.value ? '#ede9fe' : 'white',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={() => setSelectedRole(role.value)}
                  style={{ accentColor: '#4f46e5' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{role.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 1 }}>{role.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, color: '#374151' }}>Full name</label>
            <input
              id="register-name"
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="Your full name"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            />
            {errors.name && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.name.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, color: '#374151' }}>Email address</label>
            <input
              id="register-email"
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            />
            {errors.email && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: 6, color: '#374151' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                type={showPwd ? 'text' : 'password'}
                className={`input ${errors.password ? 'input-error' : ''}`}
                style={{ paddingRight: 44 }}
                placeholder="Min 6 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
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
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
