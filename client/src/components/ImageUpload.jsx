import { useRef, useState } from 'react';
import api from '../services/api.js';

export default function ImageUpload({ value = [], onChange, max = 10 }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const uploadFiles = async (files) => {
    const valid = Array.from(files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    if (!valid.length) return;
    if (value.length + valid.length > max) {
      alert(`Maxim ${max} imagini permise.`);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      valid.forEach((f) => formData.append('images', f));
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...value, ...res.data.urls]);
    } catch {
      alert('Eroare la upload. Verificați dimensiunea fișierelor (max 5 MB/imagine).');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index) => onChange(value.filter((_, i) => i !== index));

  const moveLeft = (i) => {
    if (i === 0) return;
    const next = [...value];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-blue-600">Se uploadează imaginile...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-semibold text-gray-600">
              Trage pozele aici sau <span className="text-blue-600">selectează fișiere</span>
            </p>
            <p className="text-xs text-gray-400">
              JPEG, PNG, WebP · max 5 MB/imagine · max {max} imagini
            </p>
          </div>
        )}
      </div>

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {value.map((url, i) => (
            <div key={url + i} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 shadow-sm">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/200x200/e2e8f0/94a3b8?text=ERR'; }}
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                ✕
              </button>
              {/* Move left (set as main) */}
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => moveLeft(i)}
                  title="Setează ca principală"
                  className="absolute top-1 left-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  ←
                </button>
              )}
              {/* Badge: principală */}
              {i === 0 && (
                <span className="absolute bottom-1 left-1 right-1 text-center text-xs bg-black/60 text-white rounded py-0.5">
                  Principală
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-gray-400">
          {value.length}/{max} imagini · Apasă ← pentru a schimba imaginea principală
        </p>
      )}
    </div>
  );
}
