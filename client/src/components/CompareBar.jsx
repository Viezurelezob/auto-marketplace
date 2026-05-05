import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext.jsx';
import { formatPrice } from '../utils/formatters.js';

export default function CompareBar() {
  const { items, remove, clear } = useCompare();
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <p className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">Comparator</p>

        <div className="flex-1 flex items-center gap-3 overflow-x-auto min-w-0">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 flex-shrink-0">
              {item.image && (
                <img src={item.image} alt="" className="w-10 h-7 object-cover rounded flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate max-w-[110px]">{item.brand} {item.year}</p>
                <p className="text-xs text-blue-400 font-bold">{formatPrice(item.price, item.currency)}</p>
              </div>
              <button
                onClick={() => remove(item.id)}
                className="text-gray-500 hover:text-white text-lg leading-none flex-shrink-0 ml-1"
              >&times;</button>
            </div>
          ))}

          {items.length < 3 && (
            <div className="flex items-center justify-center w-28 h-11 border-2 border-dashed border-gray-700 rounded-lg flex-shrink-0">
              <span className="text-xs text-gray-600">+ mașină</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={clear} className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1">
            Golește
          </button>
          {items.length >= 2 && (
            <Link
              to="/compare"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              Compară ({items.length})
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
