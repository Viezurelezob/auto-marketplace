import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">
              Auto<span className="text-blue-400">Market</span>
            </h3>
            <p className="text-sm leading-relaxed">
              Piața auto online din România. Cumpără sau vinde mașini rapid, sigur și fără complicații.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Navigare</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/listings" className="hover:text-white transition-colors">Toate anunțurile</Link></li>
              <li><Link to="/post" className="hover:text-white transition-colors">Adaugă anunț</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Prețuri și pachete</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Cont</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Înregistrare</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Autentificare</Link></li>
              <li><Link to="/my-listings" className="hover:text-white transition-colors">Anunțurile mele</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-800 text-sm text-center">
          © {new Date().getFullYear()} AutoMarket. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}
