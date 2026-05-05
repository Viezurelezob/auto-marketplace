import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    const redirect = setTimeout(() => { window.location.href = '/my-listings'; }, 5000);
    return () => { clearInterval(t); clearTimeout(redirect); };
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Plată reușită!</h1>
        <p className="text-gray-600 mb-2">
          Anunțul tău a fost promovat cu succes. Vei apărea în secțiunea Featured.
        </p>
        {sessionId && (
          <p className="text-xs text-gray-400 mb-6 font-mono">ID sesiune: {sessionId.slice(-12)}</p>
        )}
        <p className="text-sm text-gray-500 mb-6">
          Ești redirecționat în <span className="font-bold text-blue-600">{countdown}s</span>...
        </p>
        <Link to="/my-listings" className="btn-primary w-full">
          Mergi la anunțurile mele →
        </Link>
      </div>
    </div>
  );
}
