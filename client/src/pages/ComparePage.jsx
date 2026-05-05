import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext.jsx';
import { listingsAPI } from '../services/api.js';
import { formatPrice, formatMileage } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const SPECS = [
  { label: 'Preț',           fmt: (l) => formatPrice(l.price, l.currency) },
  { label: 'An fabricație',  fmt: (l) => l.year ?? '—' },
  { label: 'Kilometraj',     fmt: (l) => l.mileage != null ? formatMileage(l.mileage) : '—' },
  { label: 'Combustibil',    fmt: (l) => l.fuelType ?? '—' },
  { label: 'Cutie viteze',   fmt: (l) => l.transmission ?? '—' },
  { label: 'Caroserie',      fmt: (l) => l.bodyType ?? '—' },
  { label: 'Putere',         fmt: (l) => l.powerHp ? `${l.powerHp} CP` : '—' },
  { label: 'Cilindree',      fmt: (l) => l.engineSize ? `${l.engineSize} L` : '—' },
  { label: 'Tracțiune',      fmt: (l) => l.driveType ?? '—' },
  { label: 'Culoare',        fmt: (l) => l.color ?? '—' },
  { label: 'Uși',            fmt: (l) => l.doors ? `${l.doors} uși` : '—' },
  { label: 'Locuri',         fmt: (l) => l.seats ?? '—' },
  { label: 'Normă poluare',  fmt: (l) => l.emissionStandard ?? '—' },
  { label: 'Proveniență',    fmt: (l) => l.origin ?? '—' },
  { label: 'Locație',        fmt: (l) => l.location ?? '—' },
  { label: 'Negociabil',     fmt: (l) => l.isNegotiable ? 'Da' : 'Nu' },
];

export default function ComparePage() {
  const { items, remove, clear } = useCompare();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const ids = items.map((i) => i.id).join(',');

  useEffect(() => {
    if (!ids) { setLoading(false); return; }
    Promise.all(items.map((item) => listingsAPI.getById(item.id)))
      .then((results) => setListings(results.map((r) => r.data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ids]);

  if (items.length < 2) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">⚖️</p>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Selectează cel puțin 2 mașini</h2>
        <p className="text-gray-500 text-sm mb-6">
          Apasă butonul <strong>+ Compară</strong> de pe cardurile de anunțuri, apoi revino aici.
        </p>
        <Link to="/listings" className="btn-primary">Caută mașini</Link>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  const colWidth = listings.length === 2 ? 'w-1/2' : 'w-1/3';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comparator mașini</h1>
          <p className="text-sm text-gray-500 mt-1">Valorile diferite sunt marcate cu albastru</p>
        </div>
        <button onClick={clear} className="btn-secondary text-sm">Golește</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[500px]">
            {/* Car headers */}
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 w-36 text-sm font-medium text-gray-500 bg-gray-50">Specificație</th>
                {listings.map((l) => (
                  <th key={l.id} className={`p-4 text-left ${colWidth} bg-white`}>
                    <div className="relative">
                      <button
                        onClick={() => remove(l.id)}
                        className="absolute -top-1 right-0 w-6 h-6 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full text-gray-400 text-sm flex items-center justify-center transition-colors"
                      >&times;</button>
                      <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-3 mr-8">
                        {l.images?.[0]
                          ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🚗</div>}
                      </div>
                      <Link
                        to={`/listings/${l.id}`}
                        className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                      >
                        {l.title}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Specs rows */}
            <tbody>
              {SPECS.map((spec, idx) => {
                const values = listings.map((l) => spec.fmt(l));
                const allSame = values.every((v) => String(v) === String(values[0]));
                return (
                  <tr key={spec.label} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-4 text-sm text-gray-500 font-medium whitespace-nowrap">{spec.label}</td>
                    {listings.map((l, li) => (
                      <td
                        key={l.id}
                        className={`p-4 text-sm font-semibold ${!allSame ? 'text-blue-700 bg-blue-50/40' : 'text-gray-800'}`}
                      >
                        {values[li]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>

            {/* Action row */}
            <tfoot>
              <tr className="border-t border-gray-200 bg-white">
                <td className="p-4" />
                {listings.map((l) => (
                  <td key={l.id} className="p-4">
                    <Link to={`/listings/${l.id}`} className="btn-primary text-sm w-full text-center block">
                      Vezi anunțul →
                    </Link>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
