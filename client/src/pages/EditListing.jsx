import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { listingsAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, COLORS, DRIVE_TYPES, EMISSION_STANDARDS, ORIGINS, DOORS_OPTIONS, CURRENT_YEAR } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ImageUpload from '../components/ImageUpload.jsx';

export default function EditListing() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [images, setImages] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    listingsAPI.getById(id).then((res) => {
      const l = res.data;
      if (l.seller.id !== user?.id && !isAdmin) {
        navigate('/my-listings');
        return;
      }
      setImages(l.images || []);
      reset({ ...l });
    }).finally(() => setLoading(false));
  }, [id, user, isAdmin, navigate, reset]);

  const onSubmit = async (data) => {
    if (images.length === 0) { setServerError('Adăugați cel puțin o imagine.'); return; }
    setServerError('');
    setSubmitting(true);
    try {
      await listingsAPI.update(id, { ...data, images });
      navigate(`/listings/${id}`);
    } catch (err) {
      setServerError(err.response?.data?.error || 'Eroare la actualizare.');
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, error, children, required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editează anunțul</h1>
      <p className="text-gray-500 text-sm mb-8">Modificați informațiile anunțului dvs.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{serverError}</div>
        )}

        {/* Imagini */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-2 pb-3 border-b">
            Fotografii <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-gray-500 mb-4">Prima imagine va fi thumbnail-ul principal. Poți reordona după upload.</p>
          <ImageUpload value={images} onChange={setImages} max={10} />
        </div>

        {/* Informații generale */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b">Informații generale</h2>
          <div className="space-y-4">
            <Field label="Titlu anunț" error={errors.title} required>
              <input {...register('title', { required: 'Titlul este obligatoriu' })} className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Marcă">
                <select {...register('brand')} className="input">
                  {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Model">
                <input {...register('model')} className="input" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="An fabricație">
                <input {...register('year')} type="number" className="input" min="1960" max={CURRENT_YEAR + 1} />
              </Field>
              <Field label="Preț">
                <input {...register('price')} type="number" className="input" min="1" />
              </Field>
              <Field label="Monedă">
                <select {...register('currency')} className="input">
                  <option value="RON">RON</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Specificații */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b">Specificații tehnice</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kilometraj">
                <input {...register('mileage')} type="number" className="input" min="0" />
              </Field>
              <Field label="Combustibil">
                <select {...register('fuelType')} className="input">
                  {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cutie de viteze">
                <select {...register('transmission')} className="input">
                  {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Caroserie">
                <select {...register('bodyType')} className="input">
                  <option value="">-</option>
                  {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Cilindree (L)">
                <input {...register('engineSize')} type="number" step="0.1" className="input" />
              </Field>
              <Field label="Putere (CP)">
                <input {...register('powerHp')} type="number" className="input" />
              </Field>
              <Field label="Culoare">
                <select {...register('color')} className="input">
                  <option value="">-</option>
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tracțiune">
                <select {...register('driveType')} className="input">
                  <option value="">-</option>
                  {DRIVE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Normă poluare">
                <select {...register('emissionStandard')} className="input">
                  <option value="">-</option>
                  {EMISSION_STANDARDS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Uși">
                <select {...register('doors')} className="input">
                  <option value="">-</option>
                  {DOORS_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Locuri">
                <input {...register('seats')} type="number" className="input" min="1" max="9" />
              </Field>
              <Field label="Proveniență">
                <select {...register('origin')} className="input">
                  <option value="">-</option>
                  {ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Locație">
                <input {...register('location')} className="input" />
              </Field>
              <Field label="Status">
                <select {...register('status')} className="input">
                  <option value="ACTIVE">Activ</option>
                  <option value="SOLD">Vândut</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <input {...register('isNegotiable')} type="checkbox" id="isNegotiable" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <label htmlFor="isNegotiable" className="text-sm font-medium text-gray-700">Prețul este negociabil</label>
            </div>
          </div>
        </div>

        {/* Descriere */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b">Descriere</h2>
          <textarea {...register('description')} rows={6} className="input resize-none" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 text-base">
            {submitting ? 'Se salvează...' : 'Salvează modificările'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Anulează</button>
        </div>
      </form>
    </div>
  );
}
