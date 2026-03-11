import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/cupboards', label: 'Cupboards' },
  { to: '/places', label: 'Places' },
  { to: '/items', label: 'Items' },
  { to: '/borrowings', label: 'Borrowings' },
  { to: '/activity', label: 'Activity Logs' },
  { to: '/users', label: 'Users' },
];

export default function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          Ceyntics Inventory
        </Link>
        <div className="topbar-right">
          <span className="pill">{user?.role || 'staff'}</span>
          <span>{user?.name}</span>
          <button onClick={logout} className="btn-outline" type="button">
            Logout
          </button>
        </div>
      </header>
      <div className="layout-grid">
        <aside className="sidenav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </aside>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
