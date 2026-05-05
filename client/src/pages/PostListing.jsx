import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { listingsAPI } from '../services/api.js';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, COLORS, DRIVE_TYPES, EMISSION_STANDARDS, ORIGINS, DOORS_OPTIONS, CURRENT_YEAR } from '../utils/formatters.js';
import ImageUpload from '../components/ImageUpload.jsx';

const DRAFT_KEY = 'listing_draft_v1';

function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; }
}

export default function PostListing() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [hasDraft, setHasDraft] = useState(() => !!loadDraft());
  const saveTimer = useRef(null);

  const savedDraft = loadDraft();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: savedDraft || {},
  });

  useEffect(() => {
    const subscription = watch((values) => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const hasContent = Object.values(values).some((v) => v !== '' && v !== undefined && v !== false);
        if (hasContent) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
          setDraftSavedAt(new Date());
          setHasDraft(true);
        }
      }, 1500);
    });
    return () => { subscription.unsubscribe(); clearTimeout(saveTimer.current); };
  }, [watch]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setDraftSavedAt(null);
    reset({});
    setImages([]);
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      setServerError('Adăugați cel puțin o imagine.');
      return;
    }
    setServerError('');
    setSubmitting(true);
    try {
      const res = await listingsAPI.create({ ...data, images });
      localStorage.removeItem(DRAFT_KEY);
      navigate(`/listings/${res.data.id}`);
    } catch (err) {
      setServerError(err.response?.data?.error || 'A apărut o eroare. Încercați din nou.');
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-2 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Adaugă anunț</h1>
        {hasDraft && (
          <button type="button" onClick={clearDraft} className="text-xs text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap mt-1">
            🗑 Șterge draft
          </button>
        )}
      </div>
      <div className="flex items-center justify-between mb-8">
        <p className="text-gray-500 text-sm">Completați informațiile despre mașina dvs.</p>
        {draftSavedAt ? (
          <span className="text-xs text-green-600">✓ Draft salvat {draftSavedAt.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
        ) : hasDraft ? (
          <span className="text-xs text-blue-600">Draft încărcat</span>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{serverError}</div>
        )}

        {/* Imagini — primul block, cel mai important */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-2 pb-3 border-b">
            Fotografii <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-gray-500 mb-4">Prima imagine va fi thumbnail-ul principal. Poți reordona după upload.</p>
          <ImageUpload value={images} onChange={setImages} max={10} />
        </div>

        {/* Informații de bază */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b">Informații generale</h2>
          <div className="space-y-4">
            <Field label="Titlu anunț" error={errors.title} required>
              <input
                {...register('title', { required: 'Titlul este obligatoriu' })}
                className="input"
                placeholder="ex. BMW Seria 5 550i — Full options, impecabil"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Marcă" error={errors.brand} required>
                <select {...register('brand', { required: 'Marca este obligatorie' })} className="input">
                  <option value="">Selectează...</option>
                  {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Model" error={errors.model} required>
                <input {...register('model', { required: 'Modelul este obligatoriu' })} className="input" placeholder="ex. Seria 5, A6, Duster" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="An fabricație" error={errors.year} required>
                <input {...register('year', { required: 'Obligatoriu', min: { value: 1960, message: 'An invalid' }, max: { value: CURRENT_YEAR + 1, message: 'An invalid' } })}
                  type="number" className="input" placeholder={String(CURRENT_YEAR)} />
              </Field>
              <Field label="Preț" error={errors.price} required>
                <input {...register('price', { required: 'Obligatoriu', min: { value: 1, message: 'Preț invalid' } })} type="number" className="input" placeholder="85000" />
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

        {/* Specificații tehnice */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b">Specificații tehnice</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kilometraj" error={errors.mileage} required>
                <input {...register('mileage', { required: 'Obligatoriu', min: { value: 0, message: 'Invalid' } })} type="number" className="input" placeholder="75000" />
              </Field>
              <Field label="Combustibil" error={errors.fuelType} required>
                <select {...register('fuelType', { required: 'Obligatoriu' })} className="input">
                  <option value="">Selectează...</option>
                  {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cutie de viteze" error={errors.transmission} required>
                <select {...register('transmission', { required: 'Obligatoriu' })} className="input">
                  <option value="">Selectează...</option>
                  {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Caroserie">
                <select {...register('bodyType')} className="input">
                  <option value="">Selectează...</option>
                  {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Cilindree (L)">
                <input {...register('engineSize')} type="number" step="0.1" className="input" placeholder="2.0" />
              </Field>
              <Field label="Putere (CP)">
                <input {...register('powerHp')} type="number" className="input" placeholder="150" />
              </Field>
              <Field label="Culoare">
                <select {...register('color')} className="input">
                  <option value="">Selectează...</option>
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tracțiune">
                <select {...register('driveType')} className="input">
                  <option value="">Selectează...</option>
                  {DRIVE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Normă poluare">
                <select {...register('emissionStandard')} className="input">
                  <option value="">Selectează...</option>
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
                <input {...register('seats')} type="number" className="input" placeholder="5" min="1" max="9" />
              </Field>
              <Field label="Proveniență">
                <select {...register('origin')} className="input">
                  <option value="">Selectează...</option>
                  {ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Locație" error={errors.location} required>
                <input {...register('location', { required: 'Obligatoriu' })} className="input" placeholder="București, Cluj-Napoca..." />
              </Field>
              <Field label="VIN (opțional)">
                <input {...register('vin')} className="input" placeholder="WBA..." />
              </Field>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input {...register('isNegotiable')} type="checkbox" id="isNegotiable" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <label htmlFor="isNegotiable" className="text-sm font-medium text-gray-700">Prețul este negociabil</label>
            </div>
          </div>
        </div>

        {/* Descriere */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b">Descriere</h2>
          <Field label="Descriere anunț" error={errors.description} required>
            <textarea
              {...register('description', { required: 'Descrierea este obligatorie', minLength: { value: 30, message: 'Minim 30 caractere' } })}
              rows={6} className="input resize-none"
              placeholder="Descrieți starea mașinii, istoricul, dotările, orice informație relevantă..."
            />
          </Field>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 text-base">
            {submitting ? 'Se publică...' : 'Publică anunțul'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Anulează</button>
        </div>
      </form>
    </div>
  );
}
