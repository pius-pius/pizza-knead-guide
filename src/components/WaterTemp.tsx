import { useState } from "react";
import {
  calculateWaterTemp,
  MIXING_METHOD_LABELS,
  type MixingMethod,
} from "@/lib/dough-calculator";

const WaterTemp = () => {
  const [tAmbiente, setTAmbiente] = useState(20);
  const [tDesiderata, setTDesiderata] = useState(25);
  const [mixingMethod, setMixingMethod] = useState<MixingMethod>("spirale");

  const tAcqua = calculateWaterTemp(tAmbiente, tDesiderata, mixingMethod);

  return (
    <section className="px-4 py-6 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-2">Temperatura Acqua</h2>
      <p className="text-center text-muted-foreground text-sm mb-4">
        Calcola la temperatura dell'acqua per ottenere la giusta temperatura dell'impasto
      </p>

      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-5">
        {/* T ambiente */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">🌡️ Temperatura ambiente</p>
            <span className="text-sm font-bold text-primary">{tAmbiente}°C</span>
          </div>
          <input type="range" min={5} max={40} value={tAmbiente}
            onChange={(e) => setTAmbiente(Number(e.target.value))}
            className="w-full accent-primary" />
        </div>

        {/* T desiderata */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">🎯 Temperatura impasto desiderata</p>
            <span className="text-sm font-bold text-primary">{tDesiderata}°C</span>
          </div>
          <input type="range" min={20} max={30} value={tDesiderata}
            onChange={(e) => setTDesiderata(Number(e.target.value))}
            className="w-full accent-primary" />
        </div>

        {/* Mixing method */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">🔧 Metodo di impasto</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(MIXING_METHOD_LABELS) as [MixingMethod, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMixingMethod(key)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  mixingMethod === key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="bg-card rounded-2xl p-6 shadow-sm text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Temperatura acqua consigliata
        </p>
        <div className="relative inline-flex items-center justify-center w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={tAcqua < 5 ? "hsl(210, 80%, 55%)" : tAcqua > 35 ? "hsl(0, 70%, 55%)" : "hsl(var(--primary))"}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - Math.min(tAcqua, 45) / 45)}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-display font-bold">{tAcqua}°C</span>
          </div>
        </div>
        {tAcqua < 0 && (
          <p className="text-xs text-destructive mt-3 font-medium">
            ⚠️ Temperatura negativa! Usa acqua con ghiaccio o abbassa la temperatura ambiente.
          </p>
        )}
        {tAcqua > 35 && (
          <p className="text-xs text-amber-600 mt-3 font-medium">
            ⚠️ Attenzione: acqua troppo calda può uccidere il lievito.
          </p>
        )}
      </div>

      {/* Info */}
      <div className="bg-secondary/50 rounded-xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Formula:</strong> T acqua = 3 × T desiderata − T ambiente − T farina − Surriscaldamento impasto.
          La farina si assume alla stessa temperatura ambiente.
        </p>
      </div>
    </section>
  );
};

export default WaterTemp;
