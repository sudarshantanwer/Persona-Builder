import { Outlet, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/datasets', label: 'Datasets' },
  { path: '/personas', label: 'Personas' },
  { path: '/campaigns', label: 'Campaigns' },
];

export default function Layout() {
  const dispatch = useDispatch();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold">Persona Builder</div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => dispatch(logout())} className="p-4 text-sm hover:bg-indigo-800">
          Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
