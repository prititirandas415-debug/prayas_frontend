import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';

function StatCard({ label, value, icon, colorClass, id }) {
  return (
    <div id={id} className="stat-card animate-slide-up">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${colorClass}`}>
        {icon}
      </div>
      <p className="text-3xl font-extrabold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    api.get('/rescue/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <Sidebar>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="glass-card p-6 bg-gradient-to-r from-brand-600 to-brand-800 border-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-brand-100 text-sm font-medium mb-1">Welcome to</p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                  PRAYAS Dashboard 🐾
                </h1>
                <p className="text-brand-200 text-sm mt-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {today}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                🚑
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            id="stat-total"
            label="Total Rescues"
            value={loadingStats ? '...' : stats?.total}
            colorClass="bg-brand-100 text-brand-600"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            id="stat-today"
            label="Today's Rescues"
            value={loadingStats ? '...' : stats?.today}
            colorClass="bg-ocean-100 text-ocean-600"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            }
          />
          <StatCard
            id="stat-on-spot"
            label="On Spot"
            value={loadingStats ? '...' : stats?.on_spot}
            colorClass="bg-emerald-100 text-emerald-600"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            id="stat-on-call"
            label="On Call"
            value={loadingStats ? '...' : stats?.on_call}
            colorClass="bg-amber-100 text-amber-600"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Rescue */}
            <button
              id="dashboard-start-rescue-btn"
              onClick={() => navigate('/rescue')}
              className="glass-card p-6 text-left hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border-2 border-transparent hover:border-brand-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Start Rescue</h3>
              <p className="text-sm text-gray-500">Log a new animal rescue operation</p>
            </button>

            {/* Rescue History */}
            <button
              id="dashboard-history-btn"
              onClick={() => navigate('/history')}
              className="glass-card p-6 text-left hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border-2 border-transparent hover:border-ocean-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Rescue History</h3>
              <p className="text-sm text-gray-500">View all past rescue operations</p>
            </button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
