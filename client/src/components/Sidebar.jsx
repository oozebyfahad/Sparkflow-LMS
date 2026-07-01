import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardCheck, Phone, Mail, Bell, Zap, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/leads', icon: Users, label: 'Lead Tracker' },
  { path: '/follow-up', icon: Bell, label: 'Follow-Up Queue' },
  { path: '/cold-call', icon: Phone, label: 'Cold Call Script' },
  { path: '/email-templates', icon: Mail, label: 'Email Templates' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const isAudit = location.pathname.startsWith('/audit');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-full"
      style={{ backgroundColor: '#1A1A2E' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#3A86FF' }}
          >
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-none tracking-wide">Sparkflow</h1>
            <p className="text-xs mt-0.5" style={{ color: '#3A86FF' }}>Lead Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive || (path === '/leads' && isAudit)
                  ? 'text-white shadow-sm'
                  : 'text-white/55 hover:text-white/90 hover:bg-white/8'
              }`
            }
            style={({ isActive }) =>
              isActive || (path === '/leads' && isAudit) ? { backgroundColor: '#3A86FF' } : {}
            }
          >
            <Icon className="shrink-0" size={18} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Tools
              </p>
            </div>
            <NavLink
              to="/leads"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-white/55 hover:text-white/90 hover:bg-white/8"
            >
              <ClipboardCheck size={18} className="shrink-0" />
              Audit Checklist
            </NavLink>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: '#3A86FF' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {user?.role || 'caller'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
