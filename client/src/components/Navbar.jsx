import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { messagesAPI } from '../services/api.js';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count: favCount } = useFavorites();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const fetch = () => messagesAPI.getUnread().then((r) => setUnread(r.data.count)).catch(() => {});
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto<span className="text-blue-400">Market</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/listings" className={linkClass}>Anunțuri</NavLink>
            <NavLink to="/map" className={linkClass}>Hartă</NavLink>
            <NavLink to="/pricing" className={linkClass}>Prețuri</NavLink>
            {isAdmin && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Favorites icon */}
                <NavLink to="/favorites" className="relative text-gray-300 hover:text-white transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {favCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {favCount > 9 ? '9+' : favCount}
                    </span>
                  )}
                </NavLink>

                {/* Messages icon */}
                <NavLink to="/messages" className="relative text-gray-300 hover:text-white transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </NavLink>

                <NavLink to="/my-listings" className={linkClass}>Anunțurile mele</NavLink>
                <Link to="/post" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  + Adaugă anunț
                </Link>

                {/* User dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium">
                    <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {user.name[0].toUpperCase()}
                    </span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Profilul meu
                    </Link>
                    <Link to="/messages" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <span>Mesaje</span>
                      {unread > 0 && <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unread}</span>}
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      Deconectare
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Autentificare</Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">Înregistrare</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-300 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-4 space-y-3">
          <Link to="/listings" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white text-sm font-medium">Anunțuri</Link>
          <Link to="/map" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white text-sm font-medium">Hartă</Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white text-sm font-medium">Prețuri</Link>
          {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white text-sm font-medium">Admin</Link>}
          {user ? (
            <>
              <Link to="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium">
                Favorite {favCount > 0 && <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{favCount}</span>}
              </Link>
              <Link to="/messages" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium">
                Mesaje {unread > 0 && <span className="w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unread}</span>}
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white text-sm font-medium">Profilul meu</Link>
              <Link to="/my-listings" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white text-sm font-medium">Anunțurile mele</Link>
              <Link to="/post" onClick={() => setMenuOpen(false)} className="block text-blue-400 font-semibold text-sm">+ Adaugă anunț</Link>
              <button onClick={handleLogout} className="block text-red-400 text-sm font-medium">Deconectare</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white text-sm font-medium">Autentificare</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-blue-400 font-semibold text-sm">Înregistrare</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
