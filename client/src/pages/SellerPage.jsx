import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sellersAPI, reviewsAPI } from '../services/api.js';
import CarCard from '../components/CarCard.jsx';
import StarRating from '../components/StarRating.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { formatDate } from '../utils/formatters.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SellerPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    Promise.all([
      sellersAPI.getById(id),
      reviewsAPI.getBySeller(id),
    ])
      .then(([sellerRes, reviewsRes]) => {
        setData(sellerRes.data);
        setReviews(reviewsRes.data.reviews);
        setAvgRating(reviewsRes.data.avgRating);
        setReviewCount(reviewsRes.data.count);
        if (user) {
          setAlreadyReviewed(reviewsRes.data.reviews.some((r) => r.reviewer.id === user.id));
        }
      })
      .catch(() => setError('Vânzătorul nu a fost găsit.'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newRating) { setReviewError('Selectează un rating.'); return; }
    setSubmitting(true);
    setReviewError('');
    try {
      const res = await reviewsAPI.create(id, { rating: newRating, comment: newComment.trim() || undefined });
      const created = res.data;
      const updated = [created, ...reviews];
      setReviews(updated);
      setAvgRating(updated.reduce((s, r) => s + r.rating, 0) / updated.length);
      setReviewCount(updated.length);
      setAlreadyReviewed(true);
      setNewRating(0);
      setNewComment('');
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Eroare la trimitere.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">👤</p>
      <h2 className="text-xl font-bold text-gray-800 mb-4">{error}</h2>
      <Link to="/listings" className="btn-primary">Înapoi la anunțuri</Link>
    </div>
  );

  const { seller, listings, soldCount, trustScore } = data;

  const trustLabel =
    trustScore >= 80 ? 'Vânzător Verificat' :
    trustScore >= 55 ? 'De Încredere' :
    trustScore >= 30 ? 'Vânzător Activ' : 'Nou pe platformă';

  const trustColor =
    trustScore >= 80 ? 'bg-green-500' :
    trustScore >= 55 ? 'bg-blue-500' :
    trustScore >= 30 ? 'bg-yellow-500' : 'bg-gray-400';

  const trustTextColor =
    trustScore >= 80 ? 'text-green-700' :
    trustScore >= 55 ? 'text-blue-700' :
    trustScore >= 30 ? 'text-yellow-700' : 'text-gray-500';

  const isOwnProfile = user?.id === seller.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Seller header */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-5">
          {seller.avatar ? (
            <img src={seller.avatar} alt={seller.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {seller.name[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              <span>Membru din {formatDate(seller.createdAt)}</span>
              <span>·</span>
              <span>{listings.length} {listings.length === 1 ? 'anunț activ' : 'anunțuri active'}</span>
              {soldCount > 0 && <span>· {soldCount} vândute</span>}
              {seller.phone && <span className="text-green-600 font-medium">✓ Telefon verificat</span>}
            </div>
            {avgRating !== null && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating value={avgRating} size="sm" />
                <span className="text-sm font-semibold text-gray-800">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({reviewCount} {reviewCount === 1 ? 'recenzie' : 'recenzii'})</span>
              </div>
            )}
          </div>

          {seller.phone && (
            phoneRevealed ? (
              <a href={`tel:${seller.phone}`} className="btn-primary hidden sm:inline-flex gap-2 flex-shrink-0">
                📞 {seller.phone}
              </a>
            ) : (
              <button
                onClick={() => setPhoneRevealed(true)}
                className="btn-primary hidden sm:inline-flex gap-2 flex-shrink-0"
              >
                📞 Afișează numărul
              </button>
            )
          )}
        </div>

        {/* Trust score */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-600">Scor de Încredere</span>
            <span className={`text-sm font-bold ${trustTextColor}`}>{trustLabel}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`${trustColor} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${trustScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Bazat pe: telefon, vechime, vânzări finalizate</span>
            <span>{trustScore}/100</span>
          </div>
        </div>
      </div>

      {/* Listings grid */}
      <h2 className="text-lg font-bold text-gray-900 mb-5">Anunțuri active ({listings.length})</h2>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🚗</p>
          <p>Niciun anunț activ momentan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((listing) => (
            <CarCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Reviews section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recenzii {reviewCount > 0 && <span className="text-gray-400 font-normal text-base">({reviewCount})</span>}
        </h2>

        {/* Add review form */}
        {user && !isOwnProfile && !alreadyReviewed && (
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Lasă o recenzie</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Rating</label>
                <StarRating value={newRating} onChange={setNewRating} size="lg" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Comentariu (opțional)</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Descrie experiența ta cu acest vânzător..."
                  className="input resize-none"
                />
              </div>
              {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Se trimite...' : 'Trimite recenzia'}
              </button>
            </form>
          </div>
        )}

        {!user && (
          <div className="card p-5 mb-6 text-center text-sm text-gray-500">
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Autentifică-te</Link> pentru a lăsa o recenzie.
          </div>
        )}

        {alreadyReviewed && (
          <div className="card p-4 mb-6 text-sm text-gray-500 bg-gray-50">
            Ai lăsat deja o recenzie pentru acest vânzător.
          </div>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">Nicio recenzie încă. Fii primul!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 overflow-hidden">
                    {r.reviewer.avatar
                      ? <img src={r.reviewer.avatar} alt={r.reviewer.name} className="w-full h-full object-cover" />
                      : r.reviewer.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{r.reviewer.name}</span>
                      <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                    </div>
                    <StarRating value={r.rating} size="sm" />
                    {r.comment && <p className="mt-2 text-sm text-gray-700 leading-relaxed">{r.comment}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
