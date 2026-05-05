import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PLANS = [
  {
    name: 'Basic',
    price: 'Gratuit',
    period: 'pentru totdeauna',
    description: 'Perfect pentru vânzătorii ocazionali',
    color: 'gray',
    features: [
      '1 anunț activ',
      'Durată 30 de zile',
      'Vizibilitate standard',
      '3 fotografii',
      'Contact direct',
    ],
    cta: 'Începe gratuit',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '49 lei',
    period: 'pe anunț / 30 zile',
    description: 'Mai multă vizibilitate, mai rapid',
    color: 'blue',
    features: [
      '1 anunț Premium',
      'Badge PREMIUM vizibil',
      'Durată 60 de zile',
      'Prioritate în căutări',
      '10 fotografii',
      'Contact direct + email',
    ],
    cta: 'Alege Premium',
    href: '/post',
    highlight: true,
  },
  {
    name: 'Dealer Starter',
    price: '149 lei',
    period: 'pe lună',
    description: 'Pentru dealeri mici și independenți',
    color: 'indigo',
    features: [
      '10 anunțuri active',
      'Badge DEALER',
      'Prioritate medie în căutări',
      'Statistici vizualizări',
      '15 fotografii / anunț',
      'Asistență email',
    ],
    cta: 'Contactați-ne',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Dealer Pro',
    price: '399 lei',
    period: 'pe lună',
    description: 'Soluția completă pentru dealeri mari',
    color: 'amber',
    features: [
      'Anunțuri nelimitate',
      'Featured automat',
      'Top în toate căutările',
      'Pagină dealer personalizată',
      'API import stoc',
      'Manager de cont dedicat',
      'Rapoarte avansate',
    ],
    cta: 'Contactați-ne',
    href: '/register',
    highlight: false,
  },
];

const colorMap = {
  gray: { border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', cta: 'btn-secondary' },
  blue: { border: 'border-blue-500 shadow-blue-100 shadow-lg', badge: 'bg-blue-600 text-white', cta: 'btn-primary' },
  indigo: { border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', cta: 'btn-secondary' },
  amber: { border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', cta: 'btn-secondary' },
};

export default function Pricing() {
  const { user } = useAuth();

  const handleMockPurchase = (planName) => {
    alert(`Simulare plată — pachetul "${planName}" a fost activat! (plata reală va fi implementată cu Stripe)`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Prețuri și pachete</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Alege planul potrivit pentru tine. Poți începe gratuit și upgrada oricând.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const colors = colorMap[plan.color];
          return (
            <div
              key={plan.name}
              className={`card p-6 flex flex-col border-2 relative ${colors.border} ${plan.highlight ? 'scale-105' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow">
                    Recomandat
                  </span>
                </div>
              )}

              <div className={`inline-block self-start px-2.5 py-0.5 text-xs font-bold rounded mb-4 ${colors.badge}`}>
                {plan.name}
              </div>

              <div className="mb-2">
                <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{plan.period}</p>
              <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {user ? (
                <button
                  onClick={() => handleMockPurchase(plan.name)}
                  className={`${colors.cta} w-full`}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link to={plan.href} className={`${colors.cta} w-full text-center`}>
                  {plan.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Întrebări frecvente</h2>
        <div className="space-y-4">
          {[
            { q: 'Pot să listez mașina gratuit?', a: 'Da! Planul Basic este 100% gratuit și vă permite să publicați un anunț pentru 30 de zile.' },
            { q: 'Când expiră un anunț Premium?', a: 'Anunțurile Premium sunt active timp de 60 de zile de la publicare.' },
            { q: 'Pot să upgrade la orice moment?', a: 'Da, puteți promova un anunț existent sau publica anunțuri noi în orice moment.' },
            { q: 'Cum funcționează plata?', a: 'Plata online prin card (Stripe) va fi disponibilă în versiunea comercială. Momentan este în faza MVP.' },
          ].map(({ q, a }) => (
            <div key={q} className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
              <p className="text-sm text-gray-600">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
