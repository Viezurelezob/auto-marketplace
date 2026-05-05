import { useState, useMemo } from 'react';

const fmt = (v) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(v);

export default function LoanCalculator({ price, currency }) {
  const [avans, setAvans] = useState(20);
  const [dae, setDae] = useState(7.5);
  const [luni, setLuni] = useState(60);

  const { rata, principal } = useMemo(() => {
    const p = price * (1 - avans / 100);
    const r = dae / 100 / 12;
    const rate = r === 0 ? p / luni : (p * r * Math.pow(1 + r, luni)) / (Math.pow(1 + r, luni) - 1);
    return { rata: rate, principal: p };
  }, [price, avans, dae, luni]);

  return (
    <div className="card p-5">
      <h3 className="font-bold text-gray-900 mb-4">🧮 Calculator Rate</h3>

      <div className="space-y-4 mb-5">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600">Avans</span>
            <span className="font-semibold text-gray-800">{avans}% — {fmt(price * avans / 100)} {currency}</span>
          </div>
          <input type="range" min="10" max="70" step="5" value={avans}
            onChange={(e) => setAvans(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600">Dobândă anuală (DAE)</span>
            <span className="font-semibold text-gray-800">{dae}%</span>
          </div>
          <input type="range" min="3" max="20" step="0.5" value={dae}
            onChange={(e) => setDae(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600">Perioadă</span>
            <span className="font-semibold text-gray-800">{luni} luni ({luni / 12} ani)</span>
          </div>
          <input type="range" min="12" max="96" step="12" value={luni}
            onChange={(e) => setLuni(Number(e.target.value))}
            className="w-full accent-blue-600 h-1.5 cursor-pointer" />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
        <p className="text-xs text-blue-600 mb-1">Sumă finanțată: {fmt(principal)} {currency}</p>
        <p className="text-2xl font-extrabold text-blue-700">{fmt(rata)} {currency}<span className="text-sm font-normal">/lună</span></p>
        <p className="text-xs text-gray-400 mt-1.5">Calcul orientativ. Condițiile finale variază la bancă.</p>
      </div>
    </div>
  );
}
