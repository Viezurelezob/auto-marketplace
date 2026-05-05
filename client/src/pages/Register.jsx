import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async ({ name, email, password, phone }) => {
    setServerError('');
    setLoading(true);
    try {
      await authRegister({ name, email, password, phone });
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Înregistrare eșuată.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Creează cont gratuit</h1>
          <p className="text-gray-500 text-sm mt-2">Vinde mașina ta sau contactează vânzătorii</p>
        </div>

        <div className="card p-8">
          {serverError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Numele complet<span className="text-red-500 ml-0.5">*</span></label>
              <input
                {...register('name', { required: 'Numele este obligatoriu', minLength: { value: 2, message: 'Minim 2 caractere' } })}
                className="input"
                placeholder="Ion Popescu"
                autoComplete="name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email<span className="text-red-500 ml-0.5">*</span></label>
              <input
                {...register('email', {
                  required: 'Email-ul este obligatoriu',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalid' },
                })}
                type="email"
                className="input"
                placeholder="email@exemplu.ro"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Telefon</label>
              <input
                {...register('phone')}
                type="tel"
                className="input"
                placeholder="+40 7xx xxx xxx"
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="label">Parolă<span className="text-red-500 ml-0.5">*</span></label>
              <input
                {...register('password', {
                  required: 'Parola este obligatorie',
                  minLength: { value: 6, message: 'Minim 6 caractere' },
                })}
                type="password"
                className="input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirmă parola<span className="text-red-500 ml-0.5">*</span></label>
              <input
                {...register('confirmPassword', {
                  required: 'Confirmarea parolei este obligatorie',
                  validate: (v) => v === password || 'Parolele nu coincid',
                })}
                type="password"
                className="input"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Se creează contul...' : 'Creează cont gratuit'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Ai deja cont?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Autentifică-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
