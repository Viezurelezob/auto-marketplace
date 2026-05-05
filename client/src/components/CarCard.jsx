import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice, formatMileage } from '../utils/formatters.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CarCard({ listing }) {
  const { id, title, brand, model, year, price, currency, mileage,
    fuelType, transmission, location, images, isFeatured, isPremium,
    status, views, isNegotiable } = listing;

  const { isFav, toggle } = useFavorites();
  const { isInCompare, toggle: toggleCompare, items: compareItems } = useCompare();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const inCompare = isInCompare(id);
  const canCompare = inCompare || compareItems.length < 3;
  const favorited = isFav(id);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (toggling) return;
    setToggling(true);
    try { await toggle(id); } finally { setToggling(false); }
  };

  const mainImage = images?.[0];

  return (
    <Link to={`/listings/${id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {mainImage ? (
            <img
              src={mainImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x500/e2e8f0/94a3b8?text=No+Image'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">Fără imagine</div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {isFeatured && <span className="badge-featured">Featured</span>}
            {isPremium && !isFeatured && <span className="badge-premium">Premium</span>}
            {isNegotiable && <span className="px-2 py-0.5 text-xs font-bold bg-green-600 text-white rounded uppercase tracking-wide">Negociabil</span>}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            disabled={toggling}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all duration-150 ${
              favorited
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
            }`}
          >
            <svg className="w-4 h-4" fill={favorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {status === 'SOLD' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="badge-sold text-sm px-4 py-1.5">VÂNDUT</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{brand} {model}</p>
          <h3 className="font-semibold text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 mb-3">{formatPrice(price, currency)}</p>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-500 mb-3">
            <span>📅 {year}</span>
            <span>🛣️ {formatMileage(mileage)}</span>
            <span>⛽ {fuelType}</span>
            <span>⚙️ {transmission}</span>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>📍 {location}</span>
            <div className="flex items-center gap-2">
              {views > 0 && <span>👁 {views}</span>}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (canCompare) toggleCompare(listing); }}
                disabled={!canCompare}
                title={!canCompare ? 'Maxim 3 mașini în comparator' : inCompare ? 'Elimină din comparator' : 'Adaugă în comparator'}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  inCompare ? 'bg-blue-100 text-blue-700' :
                  canCompare ? 'bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-500' :
                  'text-gray-300 cursor-not-allowed'}`}
              >
                {inCompare ? '✓ Compară' : '+ Compară'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
