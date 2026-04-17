import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { publicAssetUrl } from '../utils/assets';

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const avatar = publicAssetUrl(user?.profileImage);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-brand-900">
            Profile
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/edit-profile" className={navClass}>
              Edit profile
            </NavLink>
            <NavLink to="/change-password" className={navClass}>
              Password
            </NavLink>
            <NavLink to="/privacy" className={navClass}>
              Privacy
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-100"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
