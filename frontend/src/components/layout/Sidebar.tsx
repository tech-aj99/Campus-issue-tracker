import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const studentLinks = [
  { to: '/student', label: '🏠 Dashboard' },
  { to: '/raise-issue', label: '➕ Raise Issue' },
  { to: '/my-issues', label: '📋 My Issues' },
];

const staffLinks = [
  { to: '/staff', label: '🏠 Dashboard' },
  { to: '/assigned', label: '🔧 Assigned Issues' },
];

const adminLinks = [
  { to: '/admin', label: '🏠 Dashboard' },
  { to: '/all-issues', label: '📋 All Issues' },
  { to: '/analytics', label: '📊 Analytics' },
  { to: '/admin/locations', label: '🏢 Manage Locations' },
  { to: '/admin/staff', label: '👥 Staff Management' },
];

const linksByRole: Record<string, typeof studentLinks> = {
  STUDENT: studentLinks,
  STAFF: staffLinks,
  ADMIN: adminLinks,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const links = user ? linksByRole[user.role] || [] : [];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-56 bg-white border-r border-gray-200
          flex flex-col pt-16 pb-4 gap-1 transition-transform duration-300
          md:static md:z-auto md:h-auto md:translate-x-0 md:shrink-0 md:pt-4
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `mx-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </aside>
    </>
  );
}
