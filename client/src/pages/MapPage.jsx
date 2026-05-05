import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api.js';
import { getCityCoords } from '../utils/romanianCities.js';
import { formatPrice } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [mapped, setMapped] = useState(0);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [45.9, 24.9],
      zoom: 7,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    listingsAPI.getAll({ limit: 200, sort: 'newest' }).then((res) => {
      const listings = res.data.listings;
      setCount(listings.length);
      let placed = 0;

      listings.forEach((listing) => {
        const coords = getCityCoords(listing.location);
        if (!coords) return;

        // Slight random offset so markers don't stack perfectly in same city
        const jitter = [(Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04];
        const pos = [coords[0] + jitter[0], coords[1] + jitter[1]];

        const img = listing.images?.[0];
        const popupHtml = `
          <div style="width:220px;font-family:sans-serif">
            ${img ? `<img src="${img}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px">` : ''}
            <p style="font-weight:700;font-size:13px;margin:0 0 4px;color:#111;line-height:1.3">${listing.title}</p>
            <p style="font-weight:800;font-size:15px;color:#2563eb;margin:0 0 6px">${formatPrice(listing.price, listing.currency)}</p>
            <p style="font-size:11px;color:#6b7280;margin:0 0 8px">${listing.year} · ${listing.location}</p>
            <a href="/listings/${listing.id}"
               style="display:block;text-align:center;background:#2563eb;color:#fff;padding:6px 12px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600">
              Vezi anunțul →
            </a>
          </div>`;

        L.marker(pos)
          .addTo(map)
          .bindPopup(popupHtml, { maxWidth: 240 });
        placed++;
      });

      setMapped(placed);
      setLoading(false);
    }).catch(() => setLoading(false));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/listings" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">← Listă</Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-sm font-semibold text-gray-900">Hartă anunțuri</h1>
          {!loading && (
            <span className="text-xs text-gray-400">{mapped} anunțuri pe hartă din {count}</span>
          )}
        </div>
        <Link to="/listings" className="btn-primary text-xs py-1.5 px-4">
          Vezi lista completă
        </Link>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <LoadingSpinner />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}
