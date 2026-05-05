import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../services/api.js';
import { formatPrice, formatMileage, formatDate } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ expiresAt, status }) {
  if (status === 'SOLD') return null;
  const days = daysUntil(expiresAt);
  if (days === null) return null;
  if (days < 0) return <span className="text-xs text-red-600 font-medium">⚠️ Expirat</span>;
  if (days <= 3) return <span className="text-xs text-red-500 font-medium">⚠️ Expiră în {days}z</span>;
  if (days <= 7) return <span className="text-xs text-orange-500 font-medium">⏳ Expiră în {days}z</span>;
  return <span className="text-xs text-gray-400">Expiră în {days}z</span>;
}

const STATUS_LABELS = { ACTIVE: 'Activ', SOLD: 'Vândut', DRAFT: 'Draft', PENDING: 'În așteptare' };
const STATUS_COLORS = {
  ACTIVE:  'bg-green-100 text-green-700',
  SOLD:    'bg-red-100 text-red-700',
  DRAFT:   'bg-gray-100 text-gray-600',
  PENDING: 'bg-yellow-100 text-yellow-700',
};

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = () => {
    listingsAPI.getMine()
      .then((res) => setListings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchListings, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Ștergi anunțul "${title}"?`)) return;
    await listingsAPI.delete(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  const handleMarkSold = async (id) => {
    const res = await listingsAPI.markSold(id);
    setListings((prev) => prev.map((l) => l.id === id ? res.data : l));
  };

  const handlePromote = async (id) => {
    const res = await listingsAPI.promote(id);
    setListings((prev) => prev.map((l) => l.id === id ? res.data : l));
    alert('Anunțul a fost promovat ca Featured!');
  };

  const handleRenew = async (id) => {
    const res = await listingsAPI.renew(id);
    setListings((prev) => prev.map((l) => l.id === id ? res.data : l));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anunțurile mele</h1>
          <p className="text-sm text-gray-500 mt-1">{listings.length} {listings.length === 1 ? 'anunț' : 'anunțuri'}</p>
        </div>
        <Link to="/post" className="btn-primary">+ Anunț nou</Link>
      </div>

      {listings.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-5xl mb-4">🚗</p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nu ai niciun anunț</h3>
          <p className="text-gray-500 text-sm mb-6">Adaugă primul tău anunț și ajunge la mii de cumpărători.</p>
          <Link to="/post" className="btn-primary">Adaugă anunț</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((l) => (
            <div key={l.id} className="card p-5 flex gap-4">
              {/* Thumbnail */}
              <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {l.images?.[0] ? (
                  <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <Link to={`/listings/${l.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                      {l.title}
                    </Link>
                    <p className="text-sm text-blue-600 font-bold">{formatPrice(l.price, l.currency)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {l.year} • {formatMileage(l.mileage)} • {l.fuelType} • {l.location}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Publicat {formatDate(l.createdAt)}</p>
                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-400">👁 {l.views ?? 0} vizualizări</span>
                      <span className="text-xs text-gray-400">❤️ {l._count?.favorites ?? 0} favorite</span>
                      <span className="text-xs text-gray-400">💬 {l._count?.conversations ?? 0} mesaje</span>
                      <ExpiryBadge expiresAt={l.expiresAt} status={l.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[l.status]}`}>
                      {STATUS_LABELS[l.status]}
                    </span>
                    {l.isFeatured && <span className="badge-featured">Featured</span>}
                    {l.isPremium && <span className="badge-premium">Premium</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Link to={`/listings/${l.id}/edit`} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                    ✏️ Editează
                  </Link>
                  {l.status !== 'SOLD' && (
                    <>
                      <button onClick={() => handleMarkSold(l.id)} className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                        ✅ Marchează vândut
                      </button>
                      {!l.isFeatured && (
                        <button onClick={() => handlePromote(l.id)} className="text-xs px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium transition-colors">
                          ⭐ Promovează
                        </button>
                      )}
                      {l.expiresAt && (daysUntil(l.expiresAt) ?? 0) <= 7 && (
                        <button onClick={() => handleRenew(l.id)} className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors">
                          🔄 Reînnoiește
                        </button>
                      )}
                    </>
                  )}
                  {l.status === 'DRAFT' && l.expiresAt && daysUntil(l.expiresAt) < 0 && (
                    <button onClick={() => handleRenew(l.id)} className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors">
                      🔄 Reactivează
                    </button>
                  )}
                  <button onClick={() => handleDelete(l.id, l.title)} className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors">
                    🗑️ Șterge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
