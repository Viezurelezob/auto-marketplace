import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api.js';
import api from '../services/api.js';
import { formatPrice, formatDate } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const STATUS_COLORS = {
  ACTIVE:   'bg-green-100 text-green-700',
  SOLD:     'bg-red-100 text-red-700',
  DRAFT:    'bg-gray-100 text-gray-600',
  PENDING:  'bg-yellow-100 text-yellow-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('listings');

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20, ...(filter && { status: filter }) };
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getListings(params),
    ]).then(([s, l]) => {
      setStats(s.data);
      setListings(l.data.listings);
      setTotal(l.data.total);
    }).finally(() => setLoading(false));
  }, [page, filter]);

  useEffect(fetchData, [fetchData]);

  const handleStatus = async (id, status) => {
    await adminAPI.setStatus(id, status);
    fetchData();
  };

  const handleToggleFeatured = async (id, current) => {
    await adminAPI.setPremium(id, { isFeatured: !current, isPremium: !current });
    fetchData();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Ștergi "${title}"?`)) return;
    await adminAPI.delete(id);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total anunțuri', value: stats.totalListings, icon: '📋' },
            { label: 'Active', value: stats.activeListings, icon: '✅' },
            { label: 'În așteptare', value: stats.pendingListings, icon: '⏳', highlight: stats.pendingListings > 0 },
            { label: 'Featured', value: stats.featuredListings, icon: '⭐' },
            { label: 'Utilizatori', value: stats.totalUsers, icon: '👥' },
          ].map((s) => (
            <div key={s.label} className={`card p-5 ${s.highlight ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-2xl font-extrabold ${s.highlight ? 'text-yellow-700' : 'text-gray-900'}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {['listings', 'users', 'reports'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'listings' ? `Anunțuri (${total})` : t === 'users' ? 'Utilizatori' : '🚩 Raportări'}
          </button>
        ))}
      </div>

      {tab === 'listings' && (
        <>
          {/* Filters */}
          <div className="flex gap-3 mb-5 flex-wrap">
            {[
              { value: '', label: 'Toate' },
              { value: 'PENDING', label: '⏳ În așteptare' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'SOLD', label: 'Vândute' },
              { value: 'DRAFT', label: 'Draft' },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => { setFilter(s.value); setPage(1); }}
                className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors ${
                  filter === s.value
                    ? s.value === 'PENDING' ? 'bg-yellow-500 text-white' : 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Anunț</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Vânzător</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Preț</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {l.images?.[0] && (
                            <img src={l.images[0]} alt="" className="w-12 h-9 object-cover rounded-lg flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 line-clamp-1">{l.title}</p>
                            <p className="text-xs text-gray-400">{formatDate(l.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-700">{l.seller?.name}</p>
                        <p className="text-xs text-gray-400">{l.seller?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {formatPrice(l.price, l.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full w-fit ${STATUS_COLORS[l.status]}`}>
                            {l.status}
                          </span>
                          {l.isFeatured && <span className="badge-featured text-xs w-fit">Featured</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {l.status === 'PENDING' ? (
                            <>
                              <button onClick={() => handleStatus(l.id, 'ACTIVE')} className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors">
                                ✓ Aprobă
                              </button>
                              <button onClick={() => handleStatus(l.id, 'DRAFT')} className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold transition-colors">
                                ✕ Respinge
                              </button>
                            </>
                          ) : (
                            <>
                              {l.status !== 'ACTIVE' && (
                                <button onClick={() => handleStatus(l.id, 'ACTIVE')} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium">
                                  Activează
                                </button>
                              )}
                              {l.status !== 'DRAFT' && (
                                <button onClick={() => handleStatus(l.id, 'DRAFT')} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium">
                                  Draft
                                </button>
                              )}
                            </>
                          )}
                          <button onClick={() => handleToggleFeatured(l.id, l.isFeatured)} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-medium">
                            {l.isFeatured ? '★ Unfeature' : '☆ Feature'}
                          </button>
                          <button onClick={() => handleDelete(l.id, l.title)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium">
                            Șterge
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {listings.length === 0 && (
                <div className="text-center py-12 text-gray-500">Niciun anunț găsit.</div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'users' && <UsersTab />}
      {tab === 'reports' && <ReportsTab />}
    </div>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports').then((r) => setReports(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card overflow-hidden">
      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Nicio raportare.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Anunț</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Raportat de</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Motiv</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={`/listings/${r.listing?.id}`} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium line-clamp-1">
                    {r.listing?.title || r.listingId}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-800">{r.reporter?.name}</p>
                  <p className="text-xs text-gray-400">{r.reporter?.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{r.reason}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getUsers().then((r) => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Utilizator</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Telefon</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Înregistrat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
