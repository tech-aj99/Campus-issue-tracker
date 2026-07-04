import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RoleBadge } from '../common/Badge';
import Button from '../common/Button';

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <span className="font-semibold text-indigo-600 text-base mr-auto">🏫 CampusTrack</span>

      {user && (
        <div className="flex items-center gap-2">
          {/* Name — hidden on xs */}
          <span className="hidden sm:block text-sm text-gray-700 truncate max-w-[120px]">{user.name}</span>
          <RoleBadge role={user.role} />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
