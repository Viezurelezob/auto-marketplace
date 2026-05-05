import { useState } from 'react';
import { reportsAPI } from '../services/api.js';

const REASONS = [
  'Fraudă / Escrocherie',
  'Informații false despre mașină',
  'Preț incorect sau înșelător',
  'Imaginile nu corespund mașinii',
  'Anunț duplicat',
  'Altul',
];

export default function ReportModal({ listingId, onClose }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) { setError('Selectează un motiv.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await reportsAPI.create(listingId, reason);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la trimitere.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">✅</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Raportare trimisă</h3>
            <p className="text-sm text-gray-500 mb-5">Echipa noastră va analiza anunțul în cel mai scurt timp.</p>
            <button onClick={onClose} className="btn-primary px-8">Închide</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Raportează anunțul</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2">
              {REASONS.map((r) => (
                <label key={r}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${reason === r ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="reason" value={r} checked={reason === r}
                    onChange={() => { setReason(r); setError(''); }}
                    className="accent-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{r}</span>
                </label>
              ))}
              {error && <p className="text-sm text-red-600 pt-1">{error}</p>}
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Anulează</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Se trimite...' : 'Trimite raportarea'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
