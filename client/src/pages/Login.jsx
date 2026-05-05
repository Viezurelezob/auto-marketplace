import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Autentificare eșuată.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Bine ai revenit</h1>
          <p className="text-gray-500 text-sm mt-2">Intră în contul tău AutoMarket</p>
        </div>

        <div className="card p-8">
          {serverError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email</label>
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
              <label className="label">Parolă</label>
              <input
                {...register('password', { required: 'Parola este obligatorie' })}
                type="password"
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Se conectează...' : 'Autentificare'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Nu ai cont?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Înregistrează-te gratuit
            </Link>
          </p>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">Conturi demo:</p>
            <div className="text-xs text-gray-500 space-y-1 text-center">
              <p>Admin: <code className="bg-gray-100 px-1 rounded">admin@automarket.ro</code> / <code className="bg-gray-100 px-1 rounded">Admin1234!</code></p>
              <p>User: <code className="bg-gray-100 px-1 rounded">demo@automarket.ro</code> / <code className="bg-gray-100 px-1 rounded">Demo1234!</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
