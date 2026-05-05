import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listingsAPI, savedSearchesAPI } from '../services/api.js';
import CarCard from '../components/CarCard.jsx';
import Filters from '../components/Filters.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Cele mai noi' },
  { value: 'priceAsc', label: 'Preț crescător' },
  { value: 'priceDesc', label: 'Preț descrescător' },
  { value: 'mileageAsc', label: 'Km crescător' },
];

function buildParams(searchParams) {
  const p = {};
  for (const [k, v] of searchParams.entries()) {
    if (k !== 'page' && v) p[k] = v;
  }
  return p;
}

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [alertName, setAlertName] = useState('');
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertSaved, setAlertSaved] = useState(false);
  const { user } = useAuth();

  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    setLoading(true);
    listingsAPI.getAll({ ...buildParams(searchParams), page: 1, limit: 12 })
      .then((res) => {
        setListings(res.data.listings);
        setTotal(res.data.total);
        setCurrentPage(1);
        setHasMore(1 < res.data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    listingsAPI.getAll({ ...buildParams(searchParams), page: nextPage, limit: 12 })
      .then((res) => {
        setListings((prev) => [...prev, ...res.data.listings]);
        setCurrentPage(nextPage);
        setHasMore(nextPage < res.data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  };

  const handleFilter = (values) => {
    const next = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== false) {
        next.set(k, v === true ? 'true' : String(v));
      }
    });
    next.set('sort', sort);
    setSearchParams(next);
    setFiltersOpen(false);
  };

  const handleSort = (newSort) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    next.delete('page');
    setSearchParams(next);
  };

  const defaultFilterValues = Object.fromEntries(searchParams.entries());
  const hasActiveFilters = [...searchParams.entries()].some(([k, v]) => k !== 'page' && k !== 'sort' && v);

  const handleSaveSearch = async (e) => {
    e.preventDefault();
    if (!alertName.trim()) return;
    setAlertSaving(true);
    const filters = {};
    for (const [k, v] of searchParams.entries()) {
      if (k !== 'page' && k !== 'sort' && v) filters[k] = v;
    }
    try {
      await savedSearchesAPI.create({ name: alertName.trim(), filters });
      setAlertSaved(true);
      setTimeout(() => { setSaveModal(false); setAlertSaved(false); setAlertName(''); }, 1500);
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la salvare.');
    } finally {
      setAlertSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anunțuri auto</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              {total} {total === 1 ? 'rezultat' : 'rezultate'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {user && hasActiveFilters && (
            <button
              onClick={() => setSaveModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              🔔 Salvează alerta
            </button>
          )}
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="input text-sm w-auto"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden btn-secondary text-sm px-3 py-2"
          >
            Filtre
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-72 flex-shrink-0`}>
          <Filters defaultValues={defaultFilterValues} onFilter={handleFilter} />
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSpinner />
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Niciun anunț găsit</h3>
              <p className="text-gray-500 text-sm">Încearcă să modifici filtrele de căutare.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map((car) => <CarCard key={car.id} listing={car} />)}
              </div>

              <div className="mt-8 text-center">
                {hasMore ? (
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="btn-secondary px-10 py-3 text-sm font-semibold disabled:opacity-60"
                  >
                    {loadingMore
                      ? 'Se încarcă...'
                      : `Încarcă mai multe (${total - listings.length} rămase)`}
                  </button>
                ) : total > 12 ? (
                  <p className="text-sm text-gray-400">Toate cele {total} anunțuri au fost afișate</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save search modal */}
      {saveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSaveModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            {alertSaved ? (
              <div className="text-center py-4">
                <p className="text-4xl mb-2">✅</p>
                <p className="font-bold text-gray-900">Alertă salvată!</p>
                <p className="text-sm text-gray-500 mt-1">Vei fi notificat pe email când apar anunțuri noi.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Salvează alerta de căutare</h3>
                  <button onClick={() => setSaveModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Vei primi un email când apar anunțuri noi care corespund filtrelor actuale.</p>
                <form onSubmit={handleSaveSearch} className="space-y-3">
                  <input
                    type="text"
                    value={alertName}
                    onChange={(e) => setAlertName(e.target.value)}
                    placeholder='ex: "BMW E46 sub 10.000€"'
                    className="input"
                    autoFocus
                    maxLength={80}
                  />
                  <button type="submit" disabled={alertSaving || !alertName.trim()} className="btn-primary w-full">
                    {alertSaving ? 'Se salvează...' : '🔔 Activează alerta'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
