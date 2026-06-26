import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import * as XLSX from 'xlsx';

const MODE_BADGE = {
  'On Call Treatment': 'bg-amber-100 text-amber-700',
  'On Spot Treatment': 'bg-brand-100 text-brand-700',
  'Not Available':     'bg-gray-100 text-gray-600',
};

const CONDITION_BADGE = {
  'Dead':      'bg-red-100 text-red-700',
  'Not Found': 'bg-yellow-100 text-yellow-700',
  'Treatment': 'bg-green-100 text-green-700',
};

export default function RescueHistory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const fetchHistory = useCallback(async (searchTerm, pageNum) => {
    setLoading(true);
    try {
      const { data } = await api.get('/rescue/history', {
        params: { search: searchTerm, page: pageNum, limit: LIMIT },
      });
      setRecords(data.records);
      setTotal(data.total);
    } catch (err) {
      console.error('History fetch error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(search, page);
  }, [search, page, fetchHistory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClear = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const exportToExcel = async () => {
    // If we want to export all matching records (not just the current page),
    // we should make an API call to get them without a limit.
    // For simplicity, we'll request a large limit for the export.
    try {
      const { data } = await api.get('/rescue/history', {
        params: { search, page: 1, limit: 10000 },
      });
      
      const exportData = data.records.map((r) => ({
        'Rescue ID': r.rescue_id,
        'Date': new Date(r.created_at).toLocaleString('en-IN'),
        'Mode': r.treatment_mode,
        'Condition': r.condition || '-',
        'Start Meter': r.start_meter || '-',
        'End Meter': r.end_meter || '-',
        'Distance (km)': r.distance || '-',
        'Treatment': r.treatment_type || '-',
        'Medicine': r.medicine_type || '-',
        'Remark': r.remark || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rescue History');
      
      // Auto-size columns slightly
      const wscols = [
        { wch: 15 }, // Rescue ID
        { wch: 20 }, // Date
        { wch: 20 }, // Mode
        { wch: 12 }, // Condition
        { wch: 12 }, // Start
        { wch: 12 }, // End
        { wch: 12 }, // Distance
        { wch: 15 }, // Treatment
        { wch: 15 }, // Medicine
        { wch: 30 }, // Remark
      ];
      worksheet['!cols'] = wscols;

      const fileName = `PRAYAS_History_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting to excel', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Sidebar>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-slide-up">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Rescue History</h1>
            <p className="text-gray-500 text-sm mt-1">All rescue operations across all riders</p>
          </div>
          <button
            onClick={exportToExcel}
            className="btn-ocean flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="glass-card p-4 mb-6 flex flex-wrap sm:flex-nowrap gap-3 animate-slide-up">
          <div className="flex-1 w-full relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="history-search-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Rescue ID, rider name, or treatment mode..."
              className="form-input pl-12 pr-4"
            />
          </div>
          <button id="history-search-btn" type="submit" className="btn-primary px-5 py-3 flex-shrink-0 w-full sm:w-auto">
            Search
          </button>
          {search && (
            <button
              id="history-clear-btn"
              type="button"
              onClick={handleClear}
              className="btn-secondary px-4 py-3 flex-shrink-0 w-full sm:w-auto"
            >
              Clear
            </button>
          )}
        </form>

        {/* Result count */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : (
              <>
                Showing <span className="font-semibold text-gray-700">{records.length}</span> of{' '}
                <span className="font-semibold text-gray-700">{total}</span> records
                {search && <> for "<span className="text-brand-600 font-semibold">{search}</span>"</>}
              </>
            )}
          </p>
          {!loading && (
            <button
              id="history-refresh-btn"
              onClick={() => fetchHistory(search, page)}
              className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>

        {/* Tabular Records */}
        <div className="glass-card overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Rescue ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Rider</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3">Distance (km)</th>
                  <th className="px-4 py-3">Treatment / Medicine</th>
                  <th className="px-4 py-3 max-w-[200px]">Remark</th>
                  <th className="px-4 py-3 text-center">Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse-soft">
                      <td colSpan="8" className="px-4 py-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center">
                      <div className="text-4xl mb-2">🐾</div>
                      <h3 className="font-bold text-gray-700 text-base mb-1">No records found</h3>
                      <p className="text-gray-500 text-xs">
                        {search ? 'Try a different search term.' : 'No rescues have been logged yet.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-800">{r.rescue_id}</td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(r.created_at).toLocaleString('en-IN', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-700">{r.rider_name}</p>
                        <p className="text-xs text-gray-400">{r.mobile}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${MODE_BADGE[r.treatment_mode] || 'bg-gray-100'}`}>
                          {r.treatment_mode}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.condition ? (
                          <span className={`badge ${CONDITION_BADGE[r.condition] || 'bg-gray-100'}`}>
                            {r.condition}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.distance ? (
                          <span className="font-semibold text-brand-600">{r.distance}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.treatment_type ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-gray-700">{r.treatment_type}</span>
                            {r.medicine_type && <span className="text-xs text-gray-400">{r.medicine_type}</span>}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={r.remark || ''}>
                        {r.remark || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.photo ? (
                          <a
                            href={`http://localhost:5000${r.photo}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-600 hover:text-brand-700 hover:underline flex items-center justify-center gap-1 text-xs font-semibold"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              id="history-prev-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              id="history-next-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
