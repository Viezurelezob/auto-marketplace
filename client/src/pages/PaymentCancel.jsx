import { Link } from 'react-router-dom';

export default function PaymentCancel() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Plată anulată</h1>
        <p className="text-gray-600 mb-8">
          Plata a fost anulată. Anunțul tău nu a fost modificat.
        </p>
        <div className="flex flex-col gap-3">
          <Link to="/my-listings" className="btn-primary w-full">Anunțurile mele</Link>
          <Link to="/pricing" className="btn-secondary w-full">Vezi pachetele disponibile</Link>
        </div>
      </div>
    </div>
  );
}
