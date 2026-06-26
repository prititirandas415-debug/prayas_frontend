import { NavLink } from 'react-router-dom';

export default function Sidebar({ children }) {
  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-xl shadow-inner text-white">
              🐾
            </div>
            <div>
              <h1 className="text-brand-800 font-extrabold text-lg leading-tight tracking-tight">PRAYAS</h1>
              <p className="text-brand-600/80 text-[10px] font-bold uppercase tracking-wider">Animal Rescue</p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 md:gap-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/rescue"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              Start Rescue
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              History
            </NavLink>
          </nav>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
}
