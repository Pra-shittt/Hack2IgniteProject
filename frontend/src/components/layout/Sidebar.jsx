import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Briefcase, FileText, Users, Building2,
  GraduationCap, ClipboardList, Video, LogOut, Menu, X,
  ChevronRight, BookOpen, CheckSquare, Award, Bell
} from 'lucide-react';

const NAV_CONFIG = {
  STUDENT: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/internships', icon: Briefcase, label: 'Internships' },
    { to: '/applications', icon: ClipboardList, label: 'Applications' },
    { to: '/preparation', icon: BookOpen, label: 'Preparation Hub' },
    { to: '/interviews', icon: Video, label: 'Interviews' },
    { to: '/my-internship', icon: GraduationCap, label: 'My Internship' },
    { to: '/final-submission', icon: Award, label: 'Final Submission' },
    { to: '/internship-record', icon: CheckSquare, label: 'My Record' },
    { to: '/profile', icon: Users, label: 'Profile' },
  ],
  TPO_ADMIN: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/students', icon: GraduationCap, label: 'Students' },
    { to: '/companies', icon: Building2, label: 'Companies' },
    { to: '/internships', icon: Briefcase, label: 'Internships' },
    { to: '/approvals', icon: CheckSquare, label: 'Approvals / NOC' },
    { to: '/monitoring', icon: ClipboardList, label: 'Internship Monitoring' },
    { to: '/completion', icon: Award, label: 'Completion' },
  ],
  COLLEGE_MENTOR: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-students', icon: GraduationCap, label: 'My Students' },
    { to: '/final-review', icon: CheckSquare, label: 'Final Review' },
  ],
  RECRUITER: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-internships', icon: Briefcase, label: 'My Internships' },
    { to: '/applications', icon: ClipboardList, label: 'Applications' },
    { to: '/interviews', icon: Video, label: 'Interviews' },
    { to: '/offers', icon: FileText, label: 'Offers' },
  ],
  COMPANY_MENTOR: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-interns', icon: GraduationCap, label: 'My Interns' },
    { to: '/reports', icon: ClipboardList, label: 'Reports' },
    { to: '/evaluations', icon: CheckSquare, label: 'Evaluations' },
  ],
};

const ROLE_LABELS = {
  STUDENT: 'Student',
  TPO_ADMIN: 'TPO / Admin',
  COLLEGE_MENTOR: 'College Mentor',
  RECRUITER: 'Recruiter',
  COMPANY_MENTOR: 'Company Mentor',
};

const ROLE_COLORS = {
  STUDENT: '#4f46e5',
  TPO_ADMIN: '#0ea5e9',
  COLLEGE_MENTOR: '#22c55e',
  RECRUITER: '#f59e0b',
  COMPANY_MENTOR: '#8b5cf6',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const navItems = NAV_CONFIG[user?.role] || [];
  const roleColor = ROLE_COLORS[user?.role] || '#4f46e5';
  const roleLabel = ROLE_LABELS[user?.role] || user?.role;

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '260px',
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1 }}>InternSphere</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 2 }}>Internship Platform</div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 6, display: 'flex' }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ color: roleColor, fontSize: '0.72rem', fontWeight: 600, marginTop: 1 }}>{roleLabel}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: collapsed ? '10px' : '10px 12px',
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: isActive ? roleColor + '22' : 'transparent',
              color: isActive ? roleColor : '#94a3b8',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.875rem',
              transition: 'all 0.15s',
            })}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: collapsed ? '10px' : '10px 12px',
            borderRadius: 8, width: '100%', background: 'transparent',
            border: 'none', cursor: 'pointer', color: '#ef4444',
            fontWeight: 500, fontSize: '0.875rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
