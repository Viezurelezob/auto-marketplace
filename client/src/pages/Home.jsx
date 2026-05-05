import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api.js';
import CarCard from '../components/CarCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';

const CATEGORIES = [
  { label: 'SUV / 4x4', icon: '🚙', query: 'SUV' },
  { label: 'Berlina', icon: '🚗', query: 'Berlina' },
  { label: 'Break', icon: '🚐', query: 'Break' },
  { label: 'Coupe / Sport', icon: '🏎️', query: 'Coupe' },
  { label: 'Electrice', icon: '⚡', query: 'Electric', fuel: true },
  { label: 'Utilitare', icon: '🚌', query: 'Van' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { getAll: getRecentlyViewed } = useRecentlyViewed();
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed().slice(0, 4));
  }, []);

  useEffect(() => {
    Promise.all([
      listingsAPI.getAll({ featured: 'true', limit: 4 }),
      listingsAPI.getAll({ sort: 'newest', limit: 8 }),
    ]).then(([feat, lat]) => {
      setFeatured(feat.data.listings);
      setLatest(lat.data.listings);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/listings?brand=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
          <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
            Piața Auto nr. 1 din România
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Găsește mașina <span className="text-blue-400">perfectă</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Mii de anunțuri verificate. Prețuri corecte. Vânzători de încredere.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută marcă (BMW, Audi, Dacia...)"
              className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            />
            <button type="submit" className="px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
              Caută
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span>✓ Gratuit</span>
            <span>✓ Fără intermediari</span>
            <span>✓ Direct la vânzător</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Caută după categorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={cat.fuel ? `/listings?fuelType=${cat.query}` : `/listings?bodyType=${cat.query}`}
              className="card p-4 text-center hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <span className="text-3xl mb-2 block">{cat.icon}</span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Anunțuri Featured</h2>
              <p className="text-gray-500 text-sm mt-1">Mașini premium, selecție specială</p>
            </div>
            <Link to="/listings?featured=true" className="text-sm font-semibold text-blue-600 hover:underline">
              Vezi toate →
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : featured.length === 0 ? (
            <p className="text-gray-500">Niciun anunț featured momentan.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((car) => <CarCard key={car.id} listing={car} />)}
            </div>
          )}
        </div>
      </section>

      {/* Latest */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ultimele anunțuri</h2>
            <p className="text-gray-500 text-sm mt-1">Proaspăt adăugate pe platformă</p>
          </div>
          <Link to="/listings" className="text-sm font-semibold text-blue-600 hover:underline">
            Toate anunțurile →
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latest.map((car) => <CarCard key={car.id} listing={car} />)}
          </div>
        )}
      </section>

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent vizitate</h2>
              <p className="text-gray-500 text-sm mt-1">Continuă de unde ai rămas</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyViewed.map((car) => (
              <Link key={car.id} to={`/listings/${car.id}`}
                className="card overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                  {car.image
                    ? <img src={car.image} alt={car.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🚗</div>
                  }
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm truncate">{car.title}</p>
                  <p className="text-blue-600 font-bold text-sm mt-0.5">
                    {new Intl.NumberFormat('ro-RO').format(car.price)} {car.currency}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Vinde mașina ta rapid</h2>
          <p className="text-blue-100 text-lg mb-8">
            Adaugă anunțul gratuit în mai puțin de 5 minute și ajunge la mii de cumpărători.
          </p>
          <Link
            to="/post"
            className="inline-block px-8 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Adaugă anunț gratuit →
          </Link>
        </div>
      </section>
    </div>
  );
}
