import { useMemo } from "react";
import { Minus, Plus, Trash2, Info, ArrowRight, Upload, Circle, Settings, Check } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  RECIPES,
  getProcessDuration,
  calculateDough,
  generateProcess,
  calculatePersone,
  type RecipeType,
  type DoughInput,
  type DoughResult } from
"@/lib/dough-calculator";
import type { Teglia, MaturationMode } from "@/pages/Index";

export interface FlourItem {
  id: number;
  name: string;
  w: number;
  percent: number;
}

interface TegliaDetail extends Teglia {
  area: number;
  weight: number;
}

const BREAD_WEIGHTS = [500, 750, 1000];

// Configurable thresholds
const MIN_DURATION_HOURS = 4;
const MAX_DURATION_BEFORE_FRIGO_ALERT = 8;

interface DoughCalculatorProps {
  recipe: RecipeType;
  setRecipe: (r: RecipeType) => void;
  numPanetti: number;
  setNumPanetti: (n: number) => void;
  pesoPanetto: number;
  setPesoPanetto: (n: number) => void;
  teglie: Teglia[];
  tegliaDetails: TegliaDetail[];
  totalTegliaWeight: number;
  addTeglia: () => void;
  removeTeglia: (id: number) => void;
  updateTeglia: (id: number, field: keyof Teglia, value: number | string) => void;
  idratazione: number;
  setIdratazione: (n: number) => void;
  maturationHours: number;
  setMaturationHours: (n: number) => void;
  tAmbiente: number;
  setTAmbiente: (n: number) => void;
  breadCustom: boolean;
  setBreadCustom: (b: boolean) => void;
  breadCustomWeight: number;
  setBreadCustomWeight: (n: number) => void;
  result: DoughResult;
  input: DoughInput;
  scheduleStartTime: Date;
  scheduleEndTime: Date;
  onOpenScheduleDrawer: (mode: MaturationMode) => void;
  onNavigate?: (view: string) => void;
  onSave?: () => void;
}

const DoughCalculator = ({
  recipe, setRecipe,
  numPanetti, setNumPanetti,
  pesoPanetto, setPesoPanetto,
  teglie, tegliaDetails,
  totalTegliaWeight,
  addTeglia, removeTeglia, updateTeglia,
  idratazione, setIdratazione,
  maturationHours, setMaturationHours,
  tAmbiente, setTAmbiente,
  breadCustom, setBreadCustom,
  breadCustomWeight, setBreadCustomWeight,
  result, input,
  scheduleStartTime, scheduleEndTime,
  onOpenScheduleDrawer,
  onNavigate,
  onSave
}: DoughCalculatorProps) => {
  const { t, lang } = useI18n();
  const dateLocale = lang === "it" ? it : undefined;
  const isTeglia = recipe === "teglia_romana" || recipe === "focaccia_genovese";
  const isPane = recipe === "pane_classico";

  const scheduleDuration = useMemo(() => {
    return (scheduleEndTime.getTime() - scheduleStartTime.getTime()) / 3600000;
  }, [scheduleStartTime, scheduleEndTime]);

  const allRecipes: {key: RecipeType | "carica"; nameKey: string; disabled?: boolean;}[] = [
    { key: "napoletana", nameKey: "recipe.napoletana" },
    { key: "teglia_romana", nameKey: "recipe.teglia_romana" },
    { key: "pane_classico", nameKey: "recipe.pane_classico" },
    { key: "focaccia_genovese", nameKey: "recipe.focaccia_genovese" },
    { key: "napoletana_contemporanea", nameKey: "recipe.napoletana_contemporanea" },
    { key: "carica", nameKey: "recipe.carica", disabled: true },
  ];

  const durationH = Math.floor(scheduleDuration);
  const durationM = Math.round((scheduleDuration - durationH) * 60);
  const processIncompatible = scheduleStartTime.getTime() < Date.now();
  const isTooShort = scheduleDuration < MIN_DURATION_HOURS;
  const isTooLong = scheduleDuration > MAX_DURATION_BEFORE_FRIGO_ALERT;

  return (
    <section className="px-4 py-6 space-y-4 animate-fade-in">
      {/* 1. Recipe selector */}
      <div className="glass rounded-2xl p-5 shadow-card">
        <p className="font-display font-bold uppercase tracking-wider mb-4 text-center text-sm text-primary">{t("recipe.title")}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {allRecipes.map((r) =>
          <button
            key={r.key}
            disabled={r.disabled}
            onClick={() => r.key !== "carica" && setRecipe(r.key as RecipeType)}
            className={cn(
              "py-3 px-3 rounded-xl text-xs font-semibold transition-all duration-200 min-h-[48px] flex items-center justify-center",
              r.disabled && "opacity-30 cursor-not-allowed",
              !r.disabled && recipe === r.key ?
              "bg-primary text-primary-foreground shadow-glow scale-[1.02]" :
              "bg-secondary/60 text-secondary-foreground hover:bg-secondary hover:scale-[1.01]"
            )}>
            
              {r.disabled && <Upload className="h-3 w-3 inline mr-1" />}
              {t(r.nameKey as any)}
              {r.disabled && <span className="block text-[9px] opacity-70">{t("recipe.coming_soon")}</span>}
            </button>
          )}
        </div>
      </div>

      {/* 2. Quantity */}
      <div className="glass rounded-2xl p-5 shadow-card space-y-4">
        {isTeglia ?
        <div>
            <p className="text-xs font-display font-bold uppercase tracking-wider mb-3 text-center text-primary">{t("qty.teglia_title")}</p>
            <div className="space-y-3">
              {tegliaDetails.map((tg, i) =>
            <div key={tg.id} className="bg-secondary/40 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground">{t("qty.teglia")} {i + 1}</span>
                    {teglie.length > 1 &&
                <button onClick={() => removeTeglia(tg.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                }
                  </div>
                  <div className="flex gap-1.5 mb-2">
                    <button
                  onClick={() => updateTeglia(tg.id, "shape", "rettangolare")}
                  className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all text-center",
                  tg.shape === "rettangolare" ? "bg-primary text-primary-foreground shadow-glow" : "bg-card text-muted-foreground")}>
                   ▭  {t("qty.rettangolare")}</button>
                    <button
                  onClick={() => updateTeglia(tg.id, "shape", "rotonda")}
                  className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all",
                  tg.shape === "rotonda" ? "bg-primary text-primary-foreground shadow-glow" : "bg-card text-muted-foreground")}>
                  <Circle className="h-2.5 w-2.5 inline mr-0.5" /> {t("qty.rotonda")}</button>
                  </div>
                  {tg.shape === "rettangolare" ?
              <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">{t("qty.larghezza")}</p>
                        <input type="number" value={tg.width || ""}
                  onChange={(e) => updateTeglia(tg.id, "width", e.target.value === "" ? 0 : Number(e.target.value))}
                  onBlur={() => { if (tg.width < 1) updateTeglia(tg.id, "width", 1); }}
                  className="w-full bg-card rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">{t("qty.lunghezza")}</p>
                        <input type="number" value={tg.height || ""}
                  onChange={(e) => updateTeglia(tg.id, "height", e.target.value === "" ? 0 : Number(e.target.value))}
                  onBlur={() => { if (tg.height < 1) updateTeglia(tg.id, "height", 1); }}
                  className="w-full bg-card rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
                      </div>
                    </div> :

              <div>
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">{t("qty.diametro")}</p>
                      <input type="number" value={tg.diameter || ""}
                onChange={(e) => updateTeglia(tg.id, "diameter", e.target.value === "" ? 0 : Number(e.target.value))}
                onBlur={() => { if (tg.diameter < 1) updateTeglia(tg.id, "diameter", 1); }}
                className="w-full bg-card rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" />
                    </div>
              }
                  <p className="text-[10px] text-muted-foreground mt-1.5">{tg.area} cm²</p>
                </div>
            )}
            </div>
            <Button variant="outline" onClick={addTeglia} className="w-full rounded-xl mt-3">
              <Plus className="h-4 w-4 mr-2" /> {t("qty.aggiungi_teglia")}
            </Button>
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 mt-3 space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">{t("qty.peso_totale")}</p>
                <span className="text-sm font-bold text-primary">{totalTegliaWeight}g</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {t("qty.consigliato_persone", { n: calculatePersone(totalTegliaWeight) })}
              </p>
            </div>
          </div> :
        isPane ?
        <div>
            <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("qty.peso_pane")}</p>
            <div className="flex gap-2">
              {BREAD_WEIGHTS.map((w) =>
            <button key={w}
            onClick={() => {setPesoPanetto(w);setBreadCustom(false);}}
            className={cn("flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
            !breadCustom && pesoPanetto === w ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary/60 text-secondary-foreground hover:bg-secondary")}>
                  {w}g
                </button>
            )}
              <button
              onClick={() => {setBreadCustom(true);setPesoPanetto(breadCustomWeight);}}
              className={cn("flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
              breadCustom ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary/60 text-secondary-foreground hover:bg-secondary")}>
                Custom
              </button>
            </div>
            {breadCustom &&
          <div className="mt-2">
                <input type="number" value={breadCustomWeight}
            onChange={(e) => {const v = Math.max(100, Number(e.target.value));setBreadCustomWeight(v);setPesoPanetto(v);}}
            className="w-full bg-secondary/50 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow" placeholder={lang === "it" ? "Peso in grammi" : "Weight in grams"} />
              </div>
          }
            <div className="flex items-center gap-3 mt-3">
              <p className="text-xs text-muted-foreground">{t("qty.quantita")}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-soft"
              onClick={() => setNumPanetti(Math.max(1, numPanetti - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xl font-display font-bold text-primary w-8 text-center">{numPanetti}</span>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-soft"
              onClick={() => setNumPanetti(Math.min(20, numPanetti + 1))}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div> :

        <>
            <div>
              <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-3">{t("qty.quanti_panetti")}</p>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-full shadow-soft"
              onClick={() => setNumPanetti(Math.max(1, numPanetti - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-5xl font-display font-bold text-primary tabular-nums">{numPanetti}</span>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-full shadow-soft"
              onClick={() => setNumPanetti(Math.min(50, numPanetti + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider mb-2">{t("qty.peso_panetto")}</p>
              <div className="flex gap-2">
                {[200, 250, 280, 300].map((w) =>
              <button key={w} onClick={() => setPesoPanetto(w)}
              className={cn("flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
              pesoPanetto === w ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary/60 text-secondary-foreground hover:bg-secondary")}>
                    {w}g
                  </button>
              )}
              </div>
            </div>
          </>
        }
      </div>

      {/* 3. Schedule */}
      <div className="glass rounded-2xl p-5 shadow-card space-y-3">
        <p className="text-xs font-display font-bold text-primary uppercase tracking-wider text-center">{t("sched.dimmi_quando")}</p>
        <div className="w-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/15">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onOpenScheduleDrawer("quando_inizio")}
              className="text-left hover:opacity-70 transition-all active:scale-[0.97] group"
            >
              <p className="text-[10px] text-muted-foreground uppercase font-medium">{t("sched.inizia_prep")}</p>
              <p className="text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">
                {format(scheduleStartTime, "EEE d MMM, HH:mm", { locale: dateLocale })}
              </p>
            </button>
            <div className="text-center px-3">
              <p className="text-[10px] text-muted-foreground uppercase font-medium">{t("sched.durata")}</p>
              <p className="text-sm font-display font-bold text-foreground tabular-nums">
                {durationH}h{durationM > 0 ? ` ${durationM}m` : ""}
              </p>
            </div>
            <button
              onClick={() => onOpenScheduleDrawer("quando_mangio")}
              className="text-right hover:opacity-70 transition-all active:scale-[0.97] group"
            >
              <p className="text-[10px] text-muted-foreground uppercase font-medium">{t("sched.mangio")}</p>
              <p className="text-sm font-bold text-foreground group-hover:text-foreground/80 transition-colors">
                {format(scheduleEndTime, "EEE d MMM, HH:mm", { locale: dateLocale })}
              </p>
            </button>
          </div>
          <p className="text-[10px] text-primary/50 text-center mt-2.5 font-medium">{t("sched.tocca_modificare")}</p>
        </div>
        {isTooShort && (
          <div className="bg-destructive/8 border border-destructive/20 rounded-xl p-3">
            <p className="text-[11px] text-destructive leading-relaxed font-medium">
              {t("sched.liev_troppo_corta")}
            </p>
          </div>
        )}
        {isTooLong && !isTooShort && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800 rounded-xl p-3">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
              {t("sched.consiglio_frigo")}
            </p>
          </div>
        )}
        {processIncompatible && (
          <div className="bg-destructive/8 border border-destructive/20 rounded-xl p-3">
            <p className="text-[11px] text-destructive leading-relaxed font-medium">
              {t("sched.incompatibile")}
            </p>
          </div>
        )}
      </div>

      {/* 4. Temperatura ambiente */}
      <div className="glass rounded-2xl p-5 shadow-card space-y-4">
        <TooltipProvider>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider">{t("mat.temp_ambiente")}</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex">
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px]">
                  <p className="text-xs">{t("mat.temp_info")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-lg font-display font-bold text-primary tabular-nums">{tAmbiente}°C</span>
          </div>
        </TooltipProvider>
        <input
          type="range"
          min={5}
          max={40}
          value={tAmbiente}
          onChange={(e) => setTAmbiente(Number(e.target.value))}
        />
      </div>

      {/* 5. Bottom buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onNavigate?.("avanzate")}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-muted-foreground bg-secondary/60 hover:bg-secondary rounded-xl transition-all duration-200 hover:scale-[1.01]">
          <Settings className="h-4 w-4" />
          <span>{t("btn.opzioni_avanzate")}</span>
        </button>
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-muted-foreground bg-secondary/60 hover:bg-secondary rounded-xl transition-all duration-200 hover:scale-[1.01]">
          <Check className="h-4 w-4" />
          <span>{t("save.btn")}</span>
        </button>
        <Button className="flex-1 rounded-xl h-12 text-sm font-bold shadow-glow hover:shadow-elevated transition-all duration-200" onClick={() => onNavigate?.("dosi")}>
          {t("btn.vai_dosi")} <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </section>);

};

export default DoughCalculator;
