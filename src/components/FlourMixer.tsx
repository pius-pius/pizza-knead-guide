import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateMixW, getWForHours } from "@/lib/dough-calculator";
import { useI18n } from "@/lib/i18n";
import type { FlourItem } from "./DoughCalculator";

interface FlourMixerProps {
  targetWeight?: number;
  flours: FlourItem[];
  onFloursChange: (flours: FlourItem[]) => void;
  inline?: boolean;
  maturationHours?: number;
}

let nextId = 100;

const FlourMixer = ({ targetWeight, flours, onFloursChange, inline, maturationHours }: FlourMixerProps) => {
  const { t } = useI18n();
  const wTarget = maturationHours ? getWForHours(maturationHours) : undefined;
  const totalPercent = flours.reduce((s, f) => s + f.percent, 0);
  const flourWeights = flours.map(f => ({
    ...f,
    weight: targetWeight ? Math.round(targetWeight * f.percent / totalPercent) : 0,
  }));
  const mixW = calculateMixW(flourWeights.map(f => ({ name: f.name, w: f.w, weight: f.weight })));
  const totalWeight = flourWeights.reduce((s, f) => s + f.weight, 0);

  const updateFlour = (id: number, field: keyof FlourItem, value: string | number) => {
    onFloursChange(flours.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const updatePercent = (id: number, newPercent: number) => {
    newPercent = Math.max(1, Math.min(99, newPercent));
    const others = flours.filter(f => f.id !== id);
    const othersTotal = others.reduce((s, f) => s + f.percent, 0);
    if (othersTotal === 0) return;
    const remaining = 100 - newPercent;
    const updated = flours.map(f => {
      if (f.id === id) return { ...f, percent: newPercent };
      return { ...f, percent: Math.round(f.percent / othersTotal * remaining) };
    });
    const sum = updated.reduce((s, f) => s + f.percent, 0);
    if (sum !== 100 && updated.length > 1) {
      const last = updated.find(f => f.id !== id);
      if (last) last.percent += 100 - sum;
    }
    onFloursChange(updated);
  };

  const addFlour = () => {
    if (flours.length >= 4) return;
    const newPercent = Math.round(100 / (flours.length + 1));
    const remaining = 100 - newPercent;
    const oldTotal = flours.reduce((s, f) => s + f.percent, 0);
    const adjusted = flours.map(f => ({
      ...f,
      percent: Math.round(f.percent / oldTotal * remaining),
    }));
    const adjSum = adjusted.reduce((s, f) => s + f.percent, 0);
    if (adjusted.length > 0) adjusted[0].percent += remaining - adjSum;
    onFloursChange([...adjusted, { id: nextId++, name: `${t("adv.farine")} ${flours.length + 1}`, w: 250, percent: newPercent }]);
  };

  const removeFlour = (id: number) => {
    if (flours.length <= 1) return;
    const removed = flours.filter(f => f.id !== id);
    const total = removed.reduce((s, f) => s + f.percent, 0);
    const normalized = removed.map(f => ({ ...f, percent: Math.round(f.percent / total * 100) }));
    const sum = normalized.reduce((s, f) => s + f.percent, 0);
    if (normalized.length > 0) normalized[0].percent += 100 - sum;
    onFloursChange(normalized);
  };

  return (
    <div className={inline ? "space-y-3" : "px-4 py-6 space-y-4"}>
      {!inline && <h2 className="text-2xl font-bold text-center mb-2">{t("flour.title")}</h2>}

      <div className="space-y-3">
        {flourWeights.map((flour) => (
          <div key={flour.id} className="bg-secondary/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <input type="text" value={flour.name}
                onChange={(e) => updateFlour(flour.id, "name", e.target.value)}
                className="text-sm font-semibold bg-transparent border-none outline-none text-foreground w-28" />
              {flours.length > 1 && (
                <button onClick={() => removeFlour(flour.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mb-2">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">W</p>
              <div className="flex items-center gap-2">
                <button onClick={() => updateFlour(flour.id, "w", Math.max(0, flour.w - 10))}
                  className="h-8 w-8 rounded-lg bg-card text-foreground font-bold text-sm flex items-center justify-center">−</button>
                <input type="number" value={flour.w}
                  onChange={(e) => updateFlour(flour.id, "w", Number(e.target.value))}
                  className="flex-1 bg-card rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground outline-none text-center" />
                <button onClick={() => updateFlour(flour.id, "w", flour.w + 10)}
                  className="h-8 w-8 rounded-lg bg-card text-foreground font-bold text-sm flex items-center justify-center">+</button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] text-muted-foreground uppercase">{t("flour.percentuale")}</p>
                <span className="text-xs font-bold text-primary">{flour.percent}%</span>
              </div>
              <input type="range" min={1} max={99} value={flour.percent}
                onChange={(e) => updatePercent(flour.id, Number(e.target.value))}
                className="w-full accent-primary" />
              {targetWeight && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{flour.weight}g</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {flours.length < 4 && (
        <Button variant="outline" onClick={addFlour} className="w-full rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> {t("flour.aggiungi")}
        </Button>
      )}

      {wTarget && (
        <div className={`rounded-xl p-3 border-2 ${
          Math.abs(mixW - wTarget) <= 15
            ? "bg-green-50 dark:bg-green-950/30 border-green-400"
            : mixW < wTarget
              ? "bg-blue-50 dark:bg-blue-950/30 border-blue-400"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-400"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">{t("flour.w_ottenuto")}</p>
              <p className="text-3xl font-display font-bold" style={{
                color: Math.abs(mixW - wTarget) <= 15
                  ? "hsl(142, 71%, 35%)"
                  : mixW < wTarget
                    ? "hsl(217, 91%, 50%)"
                    : "hsl(32, 95%, 44%)"
              }}>{mixW}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">{t("flour.target")}</p>
              <p className="text-3xl font-display font-bold text-muted-foreground">{wTarget}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-2 relative overflow-hidden">
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-muted-foreground/40 z-10" />
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (mixW / (wTarget * 2)) * 100)}%`,
                  backgroundColor: Math.abs(mixW - wTarget) <= 15
                    ? "hsl(142, 71%, 45%)"
                    : mixW < wTarget
                      ? "hsl(217, 91%, 60%)"
                      : "hsl(32, 95%, 50%)",
                }}
              />
            </div>
            <p className="text-[10px] mt-1 font-semibold text-center" style={{
              color: Math.abs(mixW - wTarget) <= 15
                ? "hsl(142, 71%, 35%)"
                : mixW < wTarget
                  ? "hsl(217, 91%, 50%)"
                  : "hsl(32, 95%, 44%)"
            }}>
              {Math.abs(mixW - wTarget) <= 15
                ? t("flour.w_ideale")
                : mixW < wTarget
                  ? `${t("flour.w_basso")} (−${wTarget - mixW})`
                  : `${t("flour.w_alto")} (+${mixW - wTarget})`}
            </p>
          </div>
        </div>
      )}

      <div className={`grid ${wTarget ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
        {!wTarget && (
          <div className="rounded-xl p-3 text-center border bg-secondary/50 border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">{t("flour.w_ottenuto")}</p>
            <p className="text-2xl font-display font-bold text-foreground">{mixW}</p>
          </div>
        )}
        {targetWeight && (
          <div className={`rounded-xl p-3 text-center border ${
            Math.abs(totalWeight - targetWeight) <= 5 ? "bg-green-50 dark:bg-green-950/30 border-green-200" : "bg-amber-50 dark:bg-amber-950/30 border-amber-200"
          }`}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">{t("flour.peso_totale")}</p>
            <p className="text-2xl font-display font-bold" style={{
              color: Math.abs(totalWeight - targetWeight) <= 5 ? "hsl(142, 71%, 35%)" : "hsl(32, 95%, 44%)"
            }}>{totalWeight}g</p>
            <p className="text-[9px] text-muted-foreground">{t("flour.target").toLowerCase()}: {targetWeight}g</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlourMixer;
