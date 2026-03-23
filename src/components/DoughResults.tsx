import { useMemo } from "react";
import {
  calculateDough,
  calculateWaterTemp,
  getDesiredTemp,
  MIXING_METHOD_LABELS,
  type MixingMethod,
  type DoughInput,
  type PrefermentoType,
} from "@/lib/dough-calculator";
import { useI18n } from "@/lib/i18n";
import type { FlourItem } from "./DoughCalculator";

interface DoughResultsProps {
  input: DoughInput;
  tAmbiente: number;
  flourMode: "mono" | "mix";
  flours: FlourItem[];
  mixingMethod: MixingMethod;
  setMixingMethod: (m: MixingMethod) => void;
  prefermentoType: PrefermentoType;
}

const MIXING_KEYS: Record<MixingMethod, string> = {
  manuale: "mix.manuale",
  forcella: "mix.forcella",
  spirale: "mix.spirale",
  braccia_tuffanti: "mix.braccia_tuffanti",
};

const DoughResults = ({ input, tAmbiente, flourMode, flours, mixingMethod, setMixingMethod, prefermentoType }: DoughResultsProps) => {
  const { t } = useI18n();

  const result = useMemo(() => calculateDough(input), [input]);

  const tDesiderata = getDesiredTemp(input.idratazione);
  const tAcqua = calculateWaterTemp(tAmbiente, tDesiderata, mixingMethod);

  // Build flour-specific ingredient list when mix mode
  const flourIngredients = useMemo(() => {
    if (flourMode !== "mix" || flours.length < 2) return null;
    const totalPercent = flours.reduce((s, f) => s + f.percent, 0);
    return flours.map(f => ({
      name: f.name,
      weight: Math.round(result.farina * f.percent / totalPercent),
    }));
  }, [flourMode, flours, result.farina]);

  const yeastName = input.yeastType === "LDB" ? t("dosi.ldb") : t("dosi.lm");
  const prefLabel = prefermentoType === "biga" ? "biga" : "poolish";

  const ingredients = [
    ...(flourIngredients
      ? flourIngredients.map(f => ({ name: f.name, amount: `${f.weight}g`, icon: "🌾", show: true }))
      : [{ name: t("dosi.farina_totale"), amount: `${result.farina}g`, icon: "🌾", show: true }]),
    { name: t("dosi.acqua"), amount: `${result.acqua}g`, icon: "💧", show: true },
    { name: yeastName, amount: `${result.lievito}g`, icon: "🫧", show: true },
    { name: t("dosi.sale"), amount: `${result.sale}g`, icon: "🧂", show: true },
    { name: t("dosi.olio"), amount: `${result.olio}g`, icon: "🫒", show: result.olio > 0 },
    { name: t("dosi.malto"), amount: `${result.malto}g`, icon: "🍯", show: result.malto > 0 },
    { name: t("dosi.pasta_riporto"), amount: `${result.pastaDiRiporto}g`, icon: "🥖", show: result.pastaDiRiporto > 0 },
  ].filter(i => i.show);

  return (
    <section className="px-4 py-6 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-1">{t("dosi.title")}</h2>

      {/* Total */}
      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 text-center">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("dosi.impasto_totale")}</p>
        <p className="text-3xl font-display font-bold text-primary mt-1">{result.totaleImpasto}g</p>
      </div>

      {/* Ingredients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {ingredients.map((ing) => (
          <div key={ing.name} className="bg-card rounded-xl p-3.5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{ing.icon}</span>
              <span className="font-medium text-sm">{ing.name}</span>
            </div>
            <span className="text-base font-bold text-primary">{ing.amount}</span>
          </div>
        ))}
      </div>

      {/* Poolish results */}
      {input.poolishPercent > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 pt-2">
            {prefermentoType === "biga" ? "Biga" : "Poolish"}
          </p>
          {[
            { name: t(prefermentoType === "biga" ? "dosi.farina_biga" : "dosi.farina_poolish"), amount: `${result.poolishFarina}g`, icon: "🌾" },
            { name: t(prefermentoType === "biga" ? "dosi.acqua_biga" : "dosi.acqua_poolish"), amount: `${result.poolishAcqua}g`, icon: "💧" },
            { name: t(prefermentoType === "biga" ? "dosi.lievito_biga" : "dosi.lievito_poolish"), amount: `${result.poolishLievito}g`, icon: "🫧" },
          ].map((ing) => (
            <div key={ing.name} className="bg-card rounded-xl p-3.5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{ing.icon}</span>
                <span className="font-medium text-sm">{ing.name}</span>
              </div>
              <span className="text-base font-bold text-primary">{ing.amount}</span>
            </div>
          ))}
        </div>
      )}

      {/* Water temperature */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("dosi.temp_acqua")}</p>

        {/* Mixing method selector */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase mb-2">{t("dosi.metodo_impasto")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {(Object.keys(MIXING_METHOD_LABELS) as MixingMethod[]).map((key) => (
              <button key={key} onClick={() => setMixingMethod(key)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                  mixingMethod === key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground"
                }`}>
                {t(MIXING_KEYS[key] as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Result display */}
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
              <circle cx="50" cy="50" r="44" fill="none"
                stroke={tAcqua < 5 ? "hsl(210, 80%, 55%)" : tAcqua > 35 ? "hsl(0, 70%, 55%)" : "hsl(var(--primary))"}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - Math.min(Math.max(tAcqua, 0), 45) / 45)}`} />
            </svg>
            <span className="absolute text-2xl font-display font-bold">{tAcqua}°C</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {t("dosi.t_ambiente")}: {tAmbiente}°C • {t("dosi.t_impasto")}: {tDesiderata}°C
          </p>
          {tAcqua < 0 && (
            <p className="text-xs text-destructive mt-2 font-medium">
              {t("dosi.temp_negativa")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default DoughResults;
