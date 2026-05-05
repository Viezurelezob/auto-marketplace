import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-extrabold text-gray-200 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Pagina nu a fost găsită</h1>
      <p className="text-gray-500 mb-8">Pagina pe care o cauți nu există sau a fost mutată.</p>
      <Link to="/" className="btn-primary">Înapoi la pagina principală</Link>
    </div>
  );
}
