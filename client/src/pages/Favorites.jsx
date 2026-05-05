import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../services/api.js';
import CarCard from '../components/CarCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Favorites() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesAPI.getAll()
      .then((r) => setListings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anunțuri favorite</h1>
          <p className="text-sm text-gray-500 mt-1">{listings.length} {listings.length === 1 ? 'anunț salvat' : 'anunțuri salvate'}</p>
        </div>
        <Link to="/listings" className="btn-secondary text-sm">Caută anunțuri</Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">♡</p>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Nicio mașină salvată încă</h2>
          <p className="text-gray-500 mb-6">Apasă inima de pe un anunț pentru a-l salva.</p>
          <Link to="/listings" className="btn-primary">Explorează anunțuri</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((listing) => (
            <CarCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
