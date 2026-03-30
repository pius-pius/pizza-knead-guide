import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  getWForHours,
  generateProcess,
  PREFERMENTO_PARAMS,
  type YeastType,
  type DoughResult,
  type DoughInput,
  type PrefermentoType,
} from "@/lib/dough-calculator";
import FlourMixer from "./FlourMixer";
import ScheduleDrawer from "./ScheduleDrawer";
import type { FlourItem } from "./DoughCalculator";
import type { MaturationMode } from "@/pages/Index";

interface AdvancedOptionsProps {
  idratazione: number;
  setIdratazione: (n: number) => void;
  yeastType: YeastType;
  setYeastType: (t: YeastType) => void;
  lmIdratazione: 50 | 100;
  setLmIdratazione: (n: 50 | 100) => void;
  lmPercent: number;
  setLmPercent: (n: number) => void;
  lmCustomActive: boolean;
  setLmCustomActive: (b: boolean) => void;
  flourMode: "mono" | "mix";
  setFlourMode: (m: "mono" | "mix") => void;
  flours: FlourItem[];
  setFlours: (f: FlourItem[]) => void;
  autolisiHours: number;
  setAutolisiHours: (n: number) => void;
  salePercent: number;
  setSalePercent: (n: number) => void;
  olioPercent: number;
  setOlioPercent: (n: number) => void;
  maltoPercent: number;
  setMaltoPercent: (n: number) => void;
  poolishPercent: number;
  setPoolishPercent: (n: number) => void;
  poolishMaturationHours: number;
  setPoolishMaturationHours: (n: number) => void;
  tempPrefermento: number;
  setTempPrefermento: (n: number) => void;
  prefermentoType: PrefermentoType;
  setPrefermentoType: (t: PrefermentoType) => void;
  pastaDiRiporto: number;
  setPastaDiRiporto: (n: number) => void;
  pastaDiRiportoIdratazione: number;
  setPastaDiRiportoIdratazione: (n: number) => void;
  fermoFrigoHours: number;
  setFermoFrigoHours: (n: number) => void;
  maturationHours: number;
  setMaturationHours: (n: number) => void;
  tAmbiente: number;
  setTAmbiente: (n: number) => void;
  input: DoughInput;
  result: DoughResult;
  startTime: Date;
  endTime: Date;
  processDuration: number;
  maturationMode: MaturationMode;
  setMaturationMode: (m: MaturationMode) => void;
  scheduleDate?: Date;
  setScheduleDate: (d: Date | undefined) => void;
  scheduleHour: number;
  setScheduleHour: (n: number) => void;
  scheduleMinute: number;
  setScheduleMinute: (n: number) => void;
  onNavigate?: (view: string) => void;
  onSave?: () => void;
}

const AdvancedOptions = ({
  idratazione, setIdratazione,
  yeastType, setYeastType,
  lmIdratazione, setLmIdratazione,
  lmPercent, setLmPercent,
  lmCustomActive, setLmCustomActive,
  flourMode, setFlourMode,
  flours, setFlours,
  autolisiHours, setAutolisiHours,
  salePercent, setSalePercent,
  olioPercent, setOlioPercent,
  maltoPercent, setMaltoPercent,
  poolishPercent, setPoolishPercent,
  poolishMaturationHours, setPoolishMaturationHours,
  tempPrefermento, setTempPrefermento,
  prefermentoType, setPrefermentoType,
  pastaDiRiporto, setPastaDiRiporto,
  pastaDiRiportoIdratazione, setPastaDiRiportoIdratazione,
  fermoFrigoHours, setFermoFrigoHours,
  maturationHours, setMaturationHours,
  tAmbiente, setTAmbiente,
  input,
  result,
  startTime, endTime, processDuration,
  maturationMode, setMaturationMode,
  scheduleDate, setScheduleDate,
  scheduleHour, setScheduleHour,
  scheduleMinute, setScheduleMinute,
  onNavigate,
  onSave,
}: AdvancedOptionsProps) => {
  const { t, lang } = useI18n();
  const dateLocale = lang === "it" ? it : undefined;
  const wConsigliato = getWForHours(maturationHours);
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);

  const frigoTimes = useMemo(() => {
    if (fermoFrigoHours <= 0) return null;
    const steps = generateProcess(input, result);
    const frigoStep = steps.find(s => s.id === "frigo");
    if (!frigoStep) return null;
    const frigoStart = new Date(startTime.getTime() + frigoStep.startOffset * 3600000);
    const frigoEnd = new Date(frigoStart.getTime() + fermoFrigoHours * 3600000);
    return { start: frigoStart, end: frigoEnd };
  }, [input, result, startTime, fermoFrigoHours]);

  const prefParams = PREFERMENTO_PARAMS[prefermentoType];

  const handleYeastSelect = (type: "ldb" | "lm_solido" | "licoli") => {
    if (type === "ldb") {
      setYeastType("LDB");
    } else if (type === "lm_solido") {
      setYeastType("LM");
      setLmIdratazione(50);
    } else {
      setYeastType("LM");
      setLmIdratazione(100);
    }
  };

  const activeYeastButton = yeastType === "LDB" ? "ldb" : lmIdratazione === 50 ? "lm_solido" : "licoli";

  const handlePrefermentoTypeChange = (type: PrefermentoType) => {
    setPrefermentoType(type);
    const params = PREFERMENTO_PARAMS[type];
    if (poolishMaturationHours < params.minHours || poolishMaturationHours > params.maxHours) {
      setPoolishMaturationHours(type === "biga" ? 18 : 12);
    }
  };

  const yeastOptions = [
    { key: "ldb" as const, label: t("adv.ldb") },
    { key: "lm_solido" as const, label: t("adv.lm_solido") },
    { key: "licoli" as const, label: t("adv.licoli") },
  ];

  const percentSliders = [
    { label: t("adv.sale"), value: salePercent, set: setSalePercent, max: 5, step: 0.1 },
    { label: t("adv.olio"), value: olioPercent, set: setOlioPercent, max: 15, step: 0.5 },
    { label: t("adv.malto"), value: maltoPercent, set: setMaltoPercent, max: 3, step: 0.1 },
  ];

  return (
    <section className="px-4 py-6 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-2">{t("adv.title")}</h2>

      {/* 1. Tipo Lievito */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("adv.tipo_lievito")}</p>
        <div className="grid grid-cols-3 gap-2">
          {yeastOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleYeastSelect(opt.key)}
              className={cn(
                "py-2.5 rounded-xl text-xs font-semibold transition-all",
                activeYeastButton === opt.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {yeastType === "LM" && (
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setLmCustomActive(!lmCustomActive)}
              className="flex justify-between items-center mb-1 w-full text-left"
            >
              <p className={cn("text-xs font-semibold", lmCustomActive ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                {t("adv.lm_custom")}: {lmCustomActive ? t("adv.attivo") : t("adv.non_attivo")}
              </p>
              <span className={cn("text-xs font-bold", lmCustomActive ? "text-primary" : "text-muted-foreground/50")}>{lmPercent}%</span>
            </button>
            <input
              type="range" min={5} max={50} step={1} value={lmPercent}
              onChange={(e) => setLmPercent(Number(e.target.value))}
              className={cn("w-full accent-primary transition-opacity", lmCustomActive ? "opacity-100" : "opacity-30 pointer-events-none")}
              disabled={!lmCustomActive}
            />
            {lmCustomActive && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                {t("adv.sovrascrive")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Ore di maturazione */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("adv.ore_maturazione")}</p>
          <span className="text-sm font-bold text-primary">{maturationHours}h</span>
        </div>
        <input type="range" min={1} max={72} value={maturationHours}
          onChange={(e) => setMaturationHours(Number(e.target.value))} className="w-full accent-primary" />
        {maturationHours > 12 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              {t("adv.mat_12h")}
            </p>
          </div>
        )}
      </div>

      {/* 3. Fermo Frigo */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("adv.fermo_frigo")}</p>
          <span className="text-sm font-bold text-primary">{fermoFrigoHours}h</span>
        </div>
        <input type="range" min={0} max={Math.max(0, maturationHours - 1)} value={fermoFrigoHours}
          onChange={(e) => setFermoFrigoHours(Number(e.target.value))} className="w-full accent-primary" />
        <p className="text-[10px] text-muted-foreground">
          {t("adv.liev_effettiva")}: <span className="font-bold text-primary">{maturationHours - fermoFrigoHours}h</span>
          <span className="ml-1">{t("adv.mat_meno_frigo")}</span>
        </p>
        {frigoTimes && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <p className="text-[11px] text-blue-700 dark:text-blue-400">
              {t("adv.in_frigo")} <strong>{format(frigoTimes.start, "HH:mm", { locale: dateLocale })}</strong> ({format(frigoTimes.start, "EEE d MMM", { locale: dateLocale })}) {t("adv.alle")} <strong>{format(frigoTimes.end, "HH:mm", { locale: dateLocale })}</strong> ({format(frigoTimes.end, "EEE d MMM", { locale: dateLocale })})
            </p>
          </div>
        )}
      </div>

      {/* 4. Autolisi */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("adv.autolisi")}</p>
          <span className="text-sm font-bold text-primary">{autolisiHours}h</span>
        </div>
        <input type="range" min={0} max={4} step={0.5} value={autolisiHours}
          onChange={(e) => setAutolisiHours(Number(e.target.value))} className="w-full accent-primary" />
        <p className="text-[10px] text-muted-foreground">{t("adv.autolisi_note")}</p>
      </div>

      {/* 5. Prefermento */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("adv.prefermento")}</p>
        <div className="flex gap-2 mb-2">
          {(["biga", "poolish"] as PrefermentoType[]).map((type) => (
            <button key={type} onClick={() => handlePrefermentoTypeChange(type)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border-2",
                prefermentoType === type
                  ? "bg-primary text-primary-foreground shadow-md border-primary"
                  : "bg-secondary text-secondary-foreground border-transparent hover:border-primary/30"
              )}>
              {type === "biga" ? "🍞 Biga" : "🫧 Poolish"}
            </button>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-muted-foreground">
              {t("adv.farina_in")} {prefermentoType === "biga" ? "biga" : "poolish"}
            </p>
            <span className="text-sm font-bold text-primary">{poolishPercent}%</span>
          </div>
          <input type="range" min={0} max={50} value={poolishPercent}
            onChange={(e) => setPoolishPercent(Number(e.target.value))} className="w-full accent-primary" />
        </div>

        {poolishPercent > 0 && (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">
                  {t("adv.ore_mat")} {prefermentoType === "biga" ? "biga" : "poolish"}
                </p>
                <span className="text-sm font-bold text-primary">{poolishMaturationHours}h</span>
              </div>
              <input type="range" min={prefParams.minHours} max={prefParams.maxHours}
                value={poolishMaturationHours}
                onChange={(e) => setPoolishMaturationHours(Number(e.target.value))}
                className="w-full accent-primary" />
              <p className="text-[10px] text-muted-foreground mt-1">
                {t("adv.range")}: {prefParams.minHours}–{prefParams.maxHours}h
                {prefermentoType === "biga" && ` • ${t("adv.idratazione_biga")}`}
                {prefermentoType === "poolish" && ` • ${t("adv.idratazione_poolish")}`}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">
                  {t("adv.temp_prefermento")} {prefermentoType === "biga" ? "biga" : "poolish"}
                </p>
                <span className="text-sm font-bold text-primary">{tempPrefermento}°C</span>
              </div>
              <input type="range" min={10} max={35} value={tempPrefermento}
                onChange={(e) => setTempPrefermento(Number(e.target.value))} className="w-full accent-primary" />
              <p className="text-[10px] text-muted-foreground mt-1">{t("adv.temp_pref_note")}</p>
            </div>
          </>
        )}
      </div>

      {/* Schedule info */}
      <button
        onClick={() => setScheduleDrawerOpen(true)}
        className="w-full bg-card rounded-2xl p-4 shadow-sm text-left hover:bg-primary/5 transition-colors active:scale-[0.98]"
      >
        <p className="text-xs font-semibold text-primary uppercase tracking-wide text-center mb-3">
          {t("adv.quando_mangiare")}
        </p>
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
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
                {Math.floor(processDuration)}h
                {Math.round((processDuration - Math.floor(processDuration)) * 60) > 0
                  ? ` ${Math.round((processDuration - Math.floor(processDuration)) * 60)}m`
                  : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase">{t("sched.mangio")}</p>
              <p className="text-sm font-bold text-foreground">
                {format(endTime, "EEE d MMM, HH:mm", { locale: dateLocale })}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-primary/60 text-center mt-2">{t("adv.tocca_modificare")}</p>
        </div>
        {startTime.getTime() < Date.now() && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mt-3">
            <p className="text-[11px] text-destructive leading-relaxed">
              {t("adv.incompatibile")}
            </p>
          </div>
        )}
      </button>

      <ScheduleDrawer
        open={scheduleDrawerOpen}
        onOpenChange={setScheduleDrawerOpen}
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

      {/* Idratazione & condimenti */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("adv.idratazione")}</p>
            <span className="text-sm font-bold text-primary">{idratazione}%</span>
          </div>
          <input type="range" min={50} max={100} step={1} value={idratazione}
            onChange={(e) => setIdratazione(Number(e.target.value))} className="w-full accent-primary" />
        </div>

        {percentSliders.map(({ label, value, set, max, step }) => (
          <div key={label}>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <span className="text-xs font-bold text-primary">{value}%</span>
            </div>
            <input type="range" min={0} max={max} step={step} value={value}
              onChange={(e) => set(Number(e.target.value))} className="w-full accent-primary" />
          </div>
        ))}

        {/* Pasta di riporto */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("adv.pasta_riporto")}</p>
            <span className="text-sm font-bold text-primary">{pastaDiRiporto}g</span>
          </div>
          <input type="range" min={0} max={500} step={10} value={pastaDiRiporto}
            onChange={(e) => setPastaDiRiporto(Number(e.target.value))} className="w-full accent-primary" />
        </div>
      </div>

      {/* Farine */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("adv.farine")}</p>
        <div className="flex gap-2">
          <button onClick={() => setFlourMode("mono")}
            className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
              flourMode === "mono" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground")}>
            {t("adv.monofarina")}
          </button>
          <button onClick={() => setFlourMode("mix")}
            className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
              flourMode === "mix" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground")}>
            {t("adv.mix_farine")}
          </button>
        </div>
        {flourMode === "mono" ? (
          <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
            <p className="text-xs text-muted-foreground">
              {t("adv.w_consigliato")}: <span className="font-bold text-accent text-lg">{wConsigliato}</span>
              <span className="text-[10px] ml-1">{t("adv.per_mat", { n: maturationHours })}</span>
            </p>
          </div>
        ) : (
          <FlourMixer
            targetWeight={result.farina}
            flours={flours}
            onFloursChange={setFlours}
            inline
            maturationHours={maturationHours}
          />
        )}
      </div>

      {/* Bottom button */}
      <Button
        variant="outline"
        className="w-full rounded-xl h-12 text-base font-bold"
        onClick={() => onNavigate?.("ricetta")}
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> {t("btn.torna_ricetta")}
      </Button>
    </section>
  );
};

export default AdvancedOptions;
