import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { profileAPI, uploadAPI, savedSearchesAPI } from '../services/api.js';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    savedSearchesAPI.getAll().then((r) => setSavedSearches(r.data)).catch(() => {});
  }, []);

  const handleDeleteSearch = async (id) => {
    await savedSearchesAPI.delete(id);
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await profileAPI.update({ ...data, avatar: user?.avatar });
      updateUser(res.data);
      setSuccess('Profilul a fost actualizat cu succes.');
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la salvare.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('images', file);
      const res = await uploadAPI.images(formData);
      const url = res.data.urls[0];
      await profileAPI.update({ name: user.name, phone: user.phone || '', avatar: url });
      updateUser({ avatar: url });
    } catch {
      setError('Eroare la upload avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profilul meu</h1>

      {/* Avatar */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b">Fotografie profil</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <label className="btn-secondary text-sm cursor-pointer">
              {avatarUploading ? 'Se încarcă...' : 'Schimbă fotografia'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarUploading} />
            </label>
            <p className="text-xs text-gray-400 mt-1.5">JPG, PNG sau WebP. Max 8 MB.</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b">Informații personale</h2>

        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nume complet <span className="text-red-500">*</span></label>
            <input
              {...register('name', { required: 'Numele este obligatoriu' })}
              className="input"
              placeholder="Ionescu Ion"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input value={user?.email || ''} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="mt-1 text-xs text-gray-400">Email-ul nu poate fi schimbat.</p>
          </div>

          <div>
            <label className="label">Telefon</label>
            <input
              {...register('phone')}
              className="input"
              placeholder="07xx xxx xxx"
              type="tel"
            />
            <p className="mt-1 text-xs text-gray-400">Afișat cumpărătorilor interesați de anunțurile tale.</p>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-primary px-8">
              {saving ? 'Se salvează...' : 'Salvează modificările'}
            </button>
          </div>
        </form>
      </div>

      {/* Saved searches */}
      <div className="card p-6 mt-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b">
          🔔 Alerte de căutare
          <span className="ml-2 text-xs font-normal text-gray-400">({savedSearches.length}/10)</span>
        </h2>
        {savedSearches.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">Nicio alertă salvată. Aplică filtre pe pagina de anunțuri și apasă „Salvează alerta".</p>
        ) : (
          <ul className="space-y-2">
            {savedSearches.map((s) => (
              <li key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Object.entries(s.filters).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ') || 'Fără filtre specifice'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSearch(s.id)}
                  className="ml-3 flex-shrink-0 text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
                >
                  Șterge
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Account info */}
      <div className="card p-6 mt-6">
        <h2 className="text-base font-bold text-gray-900 mb-3 pb-3 border-b">Contul meu</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="text-gray-400">Rol</span>
            <span className="font-medium">{user?.role === 'ADMIN' ? 'Administrator' : 'Utilizator'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Membru din</span>
            <span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }) : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
