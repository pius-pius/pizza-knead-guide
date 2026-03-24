import { useMemo, useState } from "react";
import { Minus, Plus, ChevronDown, CalendarIcon, Clock, Trash2, Info, ArrowRight, Upload, Circle, Settings, Check } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import ScheduleDrawer from "./ScheduleDrawer";
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
  maturationMode: MaturationMode;
  setMaturationMode: (m: MaturationMode) => void;
  scheduleDate?: Date;
  setScheduleDate: (d: Date | undefined) => void;
  scheduleHour: number;
  setScheduleHour: (n: number) => void;
  scheduleMinute: number;
  setScheduleMinute: (n: number) => void;
  tAmbiente: number;
  setTAmbiente: (n: number) => void;
  breadCustom: boolean;
  setBreadCustom: (b: boolean) => void;
  breadCustomWeight: number;
  setBreadCustomWeight: (n: number) => void;
  result: DoughResult;
  input: DoughInput;
  drawerOpen: boolean;
  setDrawerOpen: (b: boolean) => void;
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
  maturationMode, setMaturationMode,
  scheduleDate, setScheduleDate,
  scheduleHour, setScheduleHour,
  scheduleMinute, setScheduleMinute,
  tAmbiente, setTAmbiente,
  breadCustom, setBreadCustom,
  breadCustomWeight, setBreadCustomWeight,
  result, input,
  drawerOpen, setDrawerOpen,
  onNavigate,
  onSave
}: DoughCalculatorProps) => {
  const { t, lang } = useI18n();
  const dateLocale = lang === "it" ? it : undefined;
  const isTeglia = recipe === "teglia_romana" || recipe === "focaccia_genovese";
  const isPane = recipe === "pane_classico";
  const [drawerMode, setDrawerMode] = useState<MaturationMode>(maturationMode);

  const processDuration = useMemo(() => getProcessDuration(input, result), [input, result]);

  const allRecipes: {key: RecipeType | "carica"; nameKey: string; disabled?: boolean;}[] = [
    { key: "napoletana", nameKey: "recipe.napoletana" },
    { key: "teglia_romana", nameKey: "recipe.teglia_romana" },
    { key: "pane_classico", nameKey: "recipe.pane_classico" },
    { key: "focaccia_genovese", nameKey: "recipe.focaccia_genovese" },
    { key: "napoletana_contemporanea", nameKey: "recipe.napoletana_contemporanea" },
    { key: "carica", nameKey: "recipe.carica", disabled: true },
  ];

  return (
    <section className="px-4 py-6 space-y-4">
      {/* 1. Recipe selector */}
      <div className="bg-card rounded-2xl p-4 shadow-sm">
        <p className="font-semibold uppercase tracking-wide mb-3 mx-[70px] text-center text-base text-primary">{t("recipe.title")}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {allRecipes.map((r) =>
          <button
            key={r.key}
            disabled={r.disabled}
            onClick={() => r.key !== "carica" && setRecipe(r.key as RecipeType)}
            className={cn(
              "py-3 px-3 rounded-xl text-xs font-semibold transition-all min-h-[48px] flex items-center justify-center",
              r.disabled && "opacity-40 cursor-not-allowed",
              !r.disabled && recipe === r.key ?
              "bg-primary text-primary-foreground shadow-md" :
              "bg-secondary text-secondary-foreground"
            )}>
            
              {r.disabled && <Upload className="h-3 w-3 inline mr-1" />}
              {t(r.nameKey as any)}
              {r.disabled && <span className="block text-[9px] opacity-70">{t("recipe.coming_soon")}</span>}
            </button>
          )}
        </div>
      </div>

      {/* 2. Quantity */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
        {isTeglia ?
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-center text-primary">{t("qty.teglia_title")}</p>
            <div className="space-y-3">
              {tegliaDetails.map((tg, i) =>
            <div key={tg.id} className="bg-secondary/50 rounded-xl p-3">
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
                  tg.shape === "rettangolare" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>
                   ▭  {t("qty.rettangolare")}</button>
                    <button
                  onClick={() => updateTeglia(tg.id, "shape", "rotonda")}
                  className={cn("flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all",
                  tg.shape === "rotonda" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>
                  <Circle className="h-2.5 w-2.5 inline mr-0.5" /> {t("qty.rotonda")}</button>
                  </div>
                  {tg.shape === "rettangolare" ?
              <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">{t("qty.larghezza")}</p>
                        <input type="number" value={tg.width || ""}
                  onChange={(e) => updateTeglia(tg.id, "width", e.target.value === "" ? 0 : Number(e.target.value))}
                  onBlur={() => { if (tg.width < 1) updateTeglia(tg.id, "width", 1); }}
                  className="w-full bg-card rounded-lg px-3 py-2 text-sm font-semibold text-foreground outline-none" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase mb-1">{t("qty.lunghezza")}</p>
                        <input type="number" value={tg.height || ""}
                  onChange={(e) => updateTeglia(tg.id, "height", e.target.value === "" ? 0 : Number(e.target.value))}
                  onBlur={() => { if (tg.height < 1) updateTeglia(tg.id, "height", 1); }}
                  className="w-full bg-card rounded-lg px-3 py-2 text-sm font-semibold text-foreground outline-none" />
                      </div>
                    </div> :

              <div>
                      <p className="text-[10px] text-muted-foreground uppercase mb-1">{t("qty.diametro")}</p>
                      <input type="number" value={tg.diameter || ""}
                onChange={(e) => updateTeglia(tg.id, "diameter", e.target.value === "" ? 0 : Number(e.target.value))}
                onBlur={() => { if (tg.diameter < 1) updateTeglia(tg.id, "diameter", 1); }}
                className="w-full bg-card rounded-lg px-3 py-2 text-sm font-semibold text-foreground outline-none" />
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
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("qty.peso_pane")}</p>
            <div className="flex gap-2">
              {BREAD_WEIGHTS.map((w) =>
            <button key={w}
            onClick={() => {setPesoPanetto(w);setBreadCustom(false);}}
            className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
            !breadCustom && pesoPanetto === w ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground")}>
                  {w}g
                </button>
            )}
              <button
              onClick={() => {setBreadCustom(true);setPesoPanetto(breadCustomWeight);}}
              className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
              breadCustom ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground")}>
                Custom
              </button>
            </div>
            {breadCustom &&
          <div className="mt-2">
                <input type="number" value={breadCustomWeight}
            onChange={(e) => {const v = Math.max(100, Number(e.target.value));setBreadCustomWeight(v);setPesoPanetto(v);}}
            className="w-full bg-secondary rounded-xl px-3 py-2 text-sm font-semibold text-foreground outline-none" placeholder={lang === "it" ? "Peso in grammi" : "Weight in grams"} />
              </div>
          }
            <div className="flex items-center gap-3 mt-3">
              <p className="text-xs text-muted-foreground">{t("qty.quantita")}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"
              onClick={() => setNumPanetti(Math.max(1, numPanetti - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xl font-bold text-primary w-8 text-center">{numPanetti}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"
              onClick={() => setNumPanetti(Math.min(20, numPanetti + 1))}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div> :

        <>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("qty.quanti_panetti")}</p>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full"
              onClick={() => setNumPanetti(Math.max(1, numPanetti - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-4xl font-display font-bold text-primary">{numPanetti}</span>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full"
              onClick={() => setNumPanetti(Math.min(50, numPanetti + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("qty.peso_panetto")}</p>
              <div className="flex gap-2">
                {[200, 250, 280, 300].map((w) =>
              <button key={w} onClick={() => setPesoPanetto(w)}
              className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
              pesoPanetto === w ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground")}>
                    {w}g
                  </button>
              )}
              </div>
            </div>
          </>
        }
      </div>

      {/* 3. Schedule */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide text-center">{t("sched.dimmi_quando")}</p>
        {(() => {
          const now = new Date();
          const scheduled = scheduleDate ? new Date(scheduleDate) : now;
          if (scheduleDate) {
            scheduled.setHours(scheduleHour, scheduleMinute, 0, 0);
          }
          const isInizio = maturationMode === "quando_inizio";
          const startTime = isInizio ?
          scheduled :
          new Date(scheduled.getTime() - processDuration * 3600 * 1000);
          const endTime = isInizio ?
          new Date(scheduled.getTime() + processDuration * 3600 * 1000) :
          scheduled;
          const durationH = Math.floor(processDuration);
          const durationM = Math.round((processDuration - durationH) * 60);
          const processIncompatible = startTime.getTime() < now.getTime();
          return (
            <>
              <button onClick={() => {setDrawerMode("quando_mangio");setMaturationMode("quando_mangio");setDrawerOpen(true);}} className="w-full bg-primary/5 rounded-xl p-3 border border-primary/10 text-left hover:bg-primary/10 transition-colors active:scale-[0.98]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">{t("sched.inizia_prep")}</p>
                    <p className="text-sm font-bold text-primary">
                      {format(startTime, "EEE d MMM, HH:mm", { locale: dateLocale })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">{t("sched.durata")}</p>
                    <p className="text-xs font-bold text-foreground">
                      {durationH}h{durationM > 0 ? ` ${durationM}m` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase">{t("sched.mangio")}</p>
                    <p className="text-sm font-bold text-foreground">
                      {format(endTime, "EEE d MMM, HH:mm", { locale: dateLocale })}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-primary/60 text-center mt-2">{t("sched.tocca_modificare")}</p>
              </button>
              {processIncompatible && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3">
                  <p className="text-[11px] text-destructive leading-relaxed">
                    {t("sched.incompatibile")}
                  </p>
                </div>
              )}
            </>);
        })()}
      </div>

      {/* 4. Maturazione */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
        <TooltipProvider>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("mat.ore")}</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px]">
                  <p className="text-xs">{t("mat.info")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-bold text-primary">{maturationHours}h</span>
          </div>
        </TooltipProvider>
        <input
          type="range"
          min={1}
          max={72}
          value={maturationHours}
          onChange={(e) => setMaturationHours(Number(e.target.value))}
          className="w-full accent-primary" />
        
        {maturationHours > 12 &&
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              {t("mat.avviso_12h")}
            </p>
          </div>
        }

        <ScheduleDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          maturationMode={maturationMode}
          setMaturationMode={setMaturationMode}
          scheduleDate={scheduleDate}
          setScheduleDate={setScheduleDate}
          scheduleHour={scheduleHour}
          setScheduleHour={setScheduleHour}
          scheduleMinute={scheduleMinute}
          setScheduleMinute={setScheduleMinute}
          processDuration={processDuration}
        />

        {/* Temperatura ambiente */}
        <div>
          <TooltipProvider>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">{t("mat.temp_ambiente")}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-xs">{t("mat.temp_info")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-bold text-primary">{tAmbiente}°C</span>
            </div>
          </TooltipProvider>
          <input
            type="range"
            min={5}
            max={40}
            value={tAmbiente}
            onChange={(e) => setTAmbiente(Number(e.target.value))}
            className="w-full accent-primary" />
          
        </div>
      </div>

      {/* 4. Bottom buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onNavigate?.("avanzate")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-muted-foreground bg-secondary rounded-xl">
          
          <Settings className="h-4 w-4" />
          <span>{t("btn.opzioni_avanzate")}</span>
        </button>
        <Button className="flex-1 rounded-xl h-11 text-sm font-bold" onClick={() => onNavigate?.("dosi")}>
          {t("btn.vai_dosi")} <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </section>);

};

export default DoughCalculator;
