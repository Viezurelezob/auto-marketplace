import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, DRIVE_TYPES, EMISSION_STANDARDS, ORIGINS, DOORS_OPTIONS, CURRENT_YEAR } from '../utils/formatters.js';

function BrandCombobox({ defaultValue, onChange }) {
  const [input, setInput] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = input.length === 0
    ? BRANDS
    : BRANDS.filter((b) => b.toLowerCase().includes(input.toLowerCase()));

  const select = (brand) => {
    setInput(brand);
    setOpen(false);
    onChange(brand);
  };

  const clear = () => {
    setInput('');
    setOpen(false);
    onChange('');
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true); onChange(''); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Toate mărcile"
          className="input text-sm pr-8"
          autoComplete="off"
        />
        {input && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); clear(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >&times;</button>
        )}
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {!input && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); clear(); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50"
            >
              Toate mărcile
            </button>
          )}
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">Niciun rezultat</p>
          ) : (
            filtered.map((b) => (
              <button
                key={b}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); select(b); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {b}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Filters({ defaultValues, onFilter }) {
  const { register, handleSubmit, reset, setValue } = useForm({ defaultValues });

  const handleReset = () => {
    reset({});
    onFilter({});
  };

  return (
    <form onSubmit={handleSubmit(onFilter)} className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filtre</h3>
        <button type="button" onClick={handleReset} className="text-xs text-blue-600 hover:underline">
          Resetează
        </button>
      </div>

      {/* Brand — autocomplete */}
      <div>
        <label className="label">Marcă</label>
        <input type="hidden" {...register('brand')} />
        <BrandCombobox
          defaultValue={defaultValues?.brand || ''}
          onChange={(val) => setValue('brand', val)}
        />
      </div>

      {/* Price */}
      <div>
        <label className="label">Preț (RON)</label>
        <div className="flex gap-2">
          <input {...register('minPrice')} type="number" placeholder="Min" className="input text-sm" min="0" />
          <input {...register('maxPrice')} type="number" placeholder="Max" className="input text-sm" min="0" />
        </div>
      </div>

      {/* Year */}
      <div>
        <label className="label">An fabricație</label>
        <div className="flex gap-2">
          <input {...register('minYear')} type="number" placeholder="De la" className="input text-sm" min="1990" max={CURRENT_YEAR} />
          <input {...register('maxYear')} type="number" placeholder="Până la" className="input text-sm" min="1990" max={CURRENT_YEAR} />
        </div>
      </div>

      {/* Mileage */}
      <div>
        <label className="label">Km maxim</label>
        <input {...register('maxMileage')} type="number" placeholder="ex. 150000" className="input text-sm" min="0" />
      </div>

      {/* Power */}
      <div>
        <label className="label">Putere (CP)</label>
        <div className="flex gap-2">
          <input {...register('minPower')} type="number" placeholder="Min" className="input text-sm" min="0" />
          <input {...register('maxPower')} type="number" placeholder="Max" className="input text-sm" min="0" />
        </div>
      </div>

      {/* Fuel */}
      <div>
        <label className="label">Combustibil</label>
        <select {...register('fuelType')} className="input text-sm">
          <option value="">Toate</option>
          {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Transmission */}
      <div>
        <label className="label">Cutie de viteze</label>
        <select {...register('transmission')} className="input text-sm">
          <option value="">Toate</option>
          {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Body type */}
      <div>
        <label className="label">Caroserie</label>
        <select {...register('bodyType')} className="input text-sm">
          <option value="">Toate</option>
          {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Drive type */}
      <div>
        <label className="label">Tracțiune</label>
        <select {...register('driveType')} className="input text-sm">
          <option value="">Toate</option>
          {DRIVE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Doors */}
      <div>
        <label className="label">Uși</label>
        <select {...register('doors')} className="input text-sm">
          <option value="">Toate</option>
          {DOORS_OPTIONS.map((d) => <option key={d} value={d}>{d} uși</option>)}
        </select>
      </div>

      {/* Emission standard */}
      <div>
        <label className="label">Normă de poluare</label>
        <select {...register('emissionStandard')} className="input text-sm">
          <option value="">Toate</option>
          {EMISSION_STANDARDS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Origin */}
      <div>
        <label className="label">Proveniență</label>
        <select {...register('origin')} className="input text-sm">
          <option value="">Toate</option>
          {ORIGINS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="label">Locație</label>
        <input {...register('location')} type="text" placeholder="Oraș sau județ" className="input text-sm" />
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input {...register('isNegotiable')} type="checkbox" id="isNegotiable" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
          <label htmlFor="isNegotiable" className="text-sm font-medium text-gray-700">Prețul este negociabil</label>
        </div>
        <div className="flex items-center gap-2">
          <input {...register('featured')} type="checkbox" id="featured" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">Doar anunțuri Featured</label>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full">
        Aplică filtre
      </button>
    </form>
  );
}
