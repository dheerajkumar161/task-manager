import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${
      isActive ? 'text-brand' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          Task<span className="text-brand">Manager</span>
        </Link>
        {token ? (
          <div className="flex items-center gap-4">
            <NavLink to="/" className={navLinkClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/tasks/new" className={navLinkClass}>
              Create Task
            </NavLink>
            <div className="hidden sm:flex flex-col text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {user?.username}
              </span>
              <span className="capitalize">{user?.role}</span>
            </div>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
