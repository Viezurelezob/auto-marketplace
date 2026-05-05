import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listingsAPI, messagesAPI, paymentsAPI } from '../services/api.js';
import CarCard from '../components/CarCard.jsx';
import LoanCalculator from '../components/LoanCalculator.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice, formatMileage, formatDate } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';
import ReportModal from '../components/ReportModal.jsx';

export default function CarDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [related, setRelated] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { add: addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setActiveImage((i) => (i - 1 + (listing?.images?.length || 1)) % (listing?.images?.length || 1));
      if (e.key === 'ArrowRight') setActiveImage((i) => (i + 1) % (listing?.images?.length || 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, listing?.images?.length]);

  usePageMeta(listing ? {
    title: `${listing.title} — ${formatPrice(listing.price, listing.currency)} | AutoMarket`,
    description: `${listing.year} · ${formatMileage(listing.mileage)} · ${listing.fuelType} · ${listing.location}`,
    image: listing.images?.[0] || null,
  } : {});

  useEffect(() => {
    setLoading(true);
    setRelated([]);
    listingsAPI.getById(id)
      .then((res) => {
        setListing(res.data);
        addRecentlyViewed(res.data);
        listingsAPI.getRelated(id).then((r) => setRelated(r.data)).catch(() => {});
        listingsAPI.getPriceHistory(id).then((r) => setPriceHistory(r.data)).catch(() => {});
      })
      .catch(() => setError('Anunțul nu a fost găsit.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest anunț?')) return;
    await listingsAPI.delete(id);
    navigate('/my-listings');
  };

  const handleMarkSold = async () => {
    const res = await listingsAPI.markSold(id);
    setListing(res.data);
  };

  const handleContact = async () => {
    if (!user) { navigate('/login'); return; }
    setContactLoading(true);
    try {
      const res = await messagesAPI.getOrCreate(id);
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la deschiderea conversației.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleStripePromote = async (plan = 'premium') => {
    if (!user) { navigate('/login'); return; }
    setStripeLoading(true);
    try {
      const res = await paymentsAPI.createCheckout({ listingId: id, plan });
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.error || 'Stripe nu este configurat. Verificați .env');
    } finally {
      setStripeLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🚗</p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">{error}</h2>
      <Link to="/listings" className="btn-primary">Înapoi la anunțuri</Link>
    </div>
  );

  const { title, brand, model, year, price, currency, mileage, fuelType, transmission,
    engineSize, powerHp, bodyType, color, vin, location, description,
    images, isFeatured, isPremium, status, seller, createdAt,
    driveType, doors, seats, emissionStandard, isNegotiable, origin, views } = listing;

  const isOwner = user?.id === seller?.id;
  const canEdit = isOwner || isAdmin;

  const specs = [
    { label: 'Marcă', value: brand },
    { label: 'Model', value: model },
    { label: 'An fabricație', value: year },
    { label: 'Kilometraj', value: formatMileage(mileage) },
    { label: 'Combustibil', value: fuelType },
    { label: 'Cutie viteze', value: transmission },
    { label: 'Caroserie', value: bodyType },
    { label: 'Tracțiune', value: driveType },
    { label: 'Culoare', value: color },
    { label: 'Cilindree', value: engineSize ? `${engineSize} L` : null },
    { label: 'Putere', value: powerHp ? `${powerHp} CP` : null },
    { label: 'Uși', value: doors ? `${doors} uși` : null },
    { label: 'Locuri', value: seats },
    { label: 'Normă poluare', value: emissionStandard },
    { label: 'Proveniență', value: origin },
    { label: 'VIN', value: vin },
    { label: 'Locație', value: location },
  ].filter((s) => s.value);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/listings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        ← Înapoi la anunțuri
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="card overflow-hidden">
            <div className="relative aspect-[16/10] bg-gray-100">
              {images?.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={title}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                  onError={(e) => { e.target.src = 'https://placehold.co/800x500/e2e8f0/94a3b8?text=No+Image'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Fără imagine</div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                {isFeatured && <span className="badge-featured">Featured</span>}
                {isPremium && <span className="badge-premium">Premium</span>}
                {status === 'SOLD' && <span className="badge-sold text-sm px-3 py-1">VÂNDUT</span>}
              </div>
              {images?.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">‹</button>
                  <button onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">›</button>
                </>
              )}
            </div>
            {images?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-blue-600' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-extrabold text-blue-600">{formatPrice(price, currency)}</p>
              {isNegotiable && <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded border border-green-200">Negociabil</span>}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Publicat {formatDate(createdAt)} · {location}</span>
              {views > 0 && <span>👁 {views} vizualizări</span>}
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${formatPrice(price, currency)}\n${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-100 transition-colors"
              >
                📲 WhatsApp
              </a>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
              >
                {copied ? '✓ Copiat!' : '🔗 Copiază link'}
              </button>
            </div>
          </div>

          {/* Specs */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Specificații tehnice</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {specs.map((s) => (
                <div key={s.label} className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">{s.label}</span>
                  <span className="text-sm font-medium text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Descriere</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
          </div>

          {/* Price history */}
          {priceHistory.length > 1 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Istoric preț</h2>
              <div className="space-y-2">
                {priceHistory.map((entry, i) => {
                  const prev = priceHistory[i - 1];
                  const dropped = prev && entry.price < prev.price;
                  const raised = prev && entry.price > prev.price;
                  return (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500">{new Date(entry.createdAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <div className="flex items-center gap-2">
                        {dropped && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">↓ Preț redus</span>}
                        {raised && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">↑ Preț mărit</span>}
                        <span className={`text-sm font-bold ${i === priceHistory.length - 1 ? 'text-blue-700' : 'text-gray-700'}`}>
                          {formatPrice(entry.price, entry.currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Seller + Actions */}
        <div className="space-y-4">
          {/* Seller */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Vânzător</h3>
            <Link to={`/sellers/${seller?.id}`} className="flex items-center gap-3 mb-5 group">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg overflow-hidden flex-shrink-0">
                {seller?.avatar
                  ? <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                  : seller?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{seller?.name}</p>
                <p className="text-xs text-blue-500">Vezi toate anunțurile →</p>
              </div>
            </Link>

            {seller?.phone && (
              phoneRevealed ? (
                <a href={`tel:${seller.phone}`} className="btn-primary w-full mb-3 gap-2">
                  📞 {seller.phone}
                </a>
              ) : (
                <button
                  onClick={() => setPhoneRevealed(true)}
                  className="btn-primary w-full mb-3 gap-2"
                >
                  📞 Afișează numărul
                </button>
              )
            )}

            {/* Mesagerie */}
            {!isOwner && user && (
              <button
                onClick={handleContact}
                disabled={contactLoading}
                className="btn-secondary w-full gap-2"
              >
                {contactLoading ? 'Se deschide...' : '💬 Trimite mesaj'}
              </button>
            )}
            {!user && (
              <Link to="/login" className="btn-secondary w-full text-center gap-2">
                💬 Autentifică-te pentru a trimite mesaj
              </Link>
            )}

            {user && !isOwner && (
              <button
                onClick={() => setShowReport(true)}
                className="w-full mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors text-center py-1"
              >
                🚩 Raportează anunțul
              </button>
            )}
          </div>

          {showReport && <ReportModal listingId={id} onClose={() => setShowReport(false)} />}

          {/* Promovare Stripe */}
          {isOwner && status !== 'SOLD' && !isFeatured && (
            <div className="card p-5 bg-amber-50 border-amber-200">
              <h3 className="font-bold text-amber-900 mb-2">⭐ Promovează anunțul</h3>
              <p className="text-sm text-amber-700 mb-4">
                Fii în top căutări și primește de 3x mai multe contacte.
              </p>
              <button
                onClick={() => handleStripePromote('premium')}
                disabled={stripeLoading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 text-sm"
              >
                {stripeLoading ? 'Se redirecționează...' : '⭐ Promovează — 49 RON'}
              </button>
            </div>
          )}

          {/* Owner actions */}
          {canEdit && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3">Acțiuni</h3>
              <div className="space-y-2">
                {status !== 'SOLD' && (
                  <>
                    <Link to={`/listings/${id}/edit`} className="btn-secondary w-full text-sm">✏️ Editează anunțul</Link>
                    <button onClick={handleMarkSold} className="btn-secondary w-full text-sm">✅ Marchează ca Vândut</button>
                  </>
                )}
                <button onClick={handleDelete} className="btn-danger w-full text-sm">🗑️ Șterge anunțul</button>
              </div>
            </div>
          )}

          {/* Loan calculator */}
          <LoanCalculator price={price} currency={currency} />

          {/* Safety tip */}
          <div className="card p-5 bg-blue-50 border-blue-100">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">Sfaturi de siguranță</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Vizitați mașina personal înainte de cumpărare</li>
              <li>• Nu transferați bani fără a vedea vehiculul</li>
              <li>• Verificați istoricul la RAR / Carfax</li>
              <li>• Cereți cartea de service completă</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related listings */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Mașini similare</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((r) => <CarCard key={r.id} listing={r} />)}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && images?.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white text-3xl hover:text-gray-300 transition-colors"
          >&times;</button>
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {activeImage + 1} / {images.length}
          </span>
          <img
            src={images[activeImage]}
            alt={title}
            className="max-w-[90vw] max-h-[80vh] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i - 1 + images.length) % images.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center text-2xl transition-colors"
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i + 1) % images.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center text-2xl transition-colors"
              >›</button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-white' : 'border-white/30 hover:border-white/60'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
