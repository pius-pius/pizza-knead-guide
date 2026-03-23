import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  onNavigate?: (tab: string) => void;
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
  const wConsigliato = getWForHours(maturationHours);
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);

  // Compute frigo times from process steps
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
    // Reset hours to default for this type
    if (poolishMaturationHours < params.minHours || poolishMaturationHours > params.maxHours) {
      setPoolishMaturationHours(type === "biga" ? 18 : 12);
    }
  };

  return (
    <section className="px-4 py-6 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-2">Opzioni Avanzate</h2>

      {/* 1. Tipo Lievito — 3 direct options */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo lievito</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: "ldb", label: "Lievito di Birra" },
            { key: "lm_solido", label: "LM Solido" },
            { key: "licoli", label: "Licoli" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => handleYeastSelect(t.key)}
              className={cn(
                "py-2.5 rounded-xl text-xs font-semibold transition-all",
                activeYeastButton === t.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* LM % custom — subito sotto tipo lievito */}
        {yeastType === "LM" && (
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setLmCustomActive(!lmCustomActive)}
              className="flex justify-between items-center mb-1 w-full text-left"
            >
              <p className={cn("text-xs font-semibold", lmCustomActive ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                Lievito madre % custom: {lmCustomActive ? "attivo" : "non attivo"}
              </p>
              <span className={cn("text-xs font-bold", lmCustomActive ? "text-primary" : "text-muted-foreground/50")}>{lmPercent}%</span>
            </button>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={lmPercent}
              onChange={(e) => setLmPercent(Number(e.target.value))}
              className={cn("w-full accent-primary transition-opacity", lmCustomActive ? "opacity-100" : "opacity-30 pointer-events-none")}
              disabled={!lmCustomActive}
            />
            {lmCustomActive && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                ⚠️ Sovrascrive il calcolo automatico
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Ore di maturazione */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ore di maturazione</p>
          <span className="text-sm font-bold text-primary">{maturationHours}h</span>
        </div>
        <input
          type="range"
          min={1}
          max={72}
          value={maturationHours}
          onChange={(e) => setMaturationHours(Number(e.target.value))}
          className="w-full accent-primary"
        />
        {maturationHours > 12 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              ⚠️ Maturazione &gt;12h: consigliato <strong>Fermo Frigo</strong>.
            </p>
          </div>
        )}
      </div>

      {/* 3. Fermo Frigo with time display */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fermo frigo (ore)</p>
          <span className="text-sm font-bold text-primary">{fermoFrigoHours}h</span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, maturationHours - 1)}
          value={fermoFrigoHours}
          onChange={(e) => setFermoFrigoHours(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <p className="text-[10px] text-muted-foreground">
          Lievitazione effettiva: <span className="font-bold text-primary">{maturationHours - fermoFrigoHours}h</span>
          <span className="ml-1">(maturazione − frigo)</span>
        </p>
        {frigoTimes && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <p className="text-[11px] text-blue-700 dark:text-blue-400">
              ❄️ In frigo dalle <strong>{format(frigoTimes.start, "HH:mm", { locale: it })}</strong> ({format(frigoTimes.start, "EEE d MMM", { locale: it })}) alle <strong>{format(frigoTimes.end, "HH:mm", { locale: it })}</strong> ({format(frigoTimes.end, "EEE d MMM", { locale: it })})
            </p>
          </div>
        )}
      </div>

      {/* 4. Autolisi */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Autolisi</p>
          <span className="text-sm font-bold text-primary">{autolisiHours}h</span>
        </div>
        <input
          type="range"
          min={0}
          max={4}
          step={0.5}
          value={autolisiHours}
          onChange={(e) => setAutolisiHours(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <p className="text-[10px] text-muted-foreground">Non influenza le dosi, solo il processo</p>
      </div>

      {/* 5. Biga / Poolish */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prefermento</p>
        <div className="flex gap-2 mb-2">
          {(["biga", "poolish"] as PrefermentoType[]).map((type) => (
            <button
              key={type}
              onClick={() => handlePrefermentoTypeChange(type)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border-2",
                prefermentoType === type
                  ? "bg-primary text-primary-foreground shadow-md border-primary"
                  : "bg-secondary text-secondary-foreground border-transparent hover:border-primary/30"
              )}
            >
              {type === "biga" ? "🍞 Biga" : "🫧 Poolish"}
            </button>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-muted-foreground">
              % farina in {prefermentoType === "biga" ? "biga" : "poolish"}
            </p>
            <span className="text-sm font-bold text-primary">{poolishPercent}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={poolishPercent}
            onChange={(e) => setPoolishPercent(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {poolishPercent > 0 && (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">
                  Ore maturazione {prefermentoType === "biga" ? "biga" : "poolish"}
                </p>
                <span className="text-sm font-bold text-primary">{poolishMaturationHours}h</span>
              </div>
              <input
                type="range"
                min={prefParams.minHours}
                max={prefParams.maxHours}
                value={poolishMaturationHours}
                onChange={(e) => setPoolishMaturationHours(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Range: {prefParams.minHours}–{prefParams.maxHours}h
                {prefermentoType === "biga" && " • Idratazione biga: 45%"}
                {prefermentoType === "poolish" && " • Idratazione poolish: 100%"}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted-foreground">
                  🌡️ Temperatura {prefermentoType === "biga" ? "biga" : "poolish"}
                </p>
                <span className="text-sm font-bold text-primary">{tempPrefermento}°C</span>
              </div>
              <input
                type="range"
                min={10}
                max={35}
                value={tempPrefermento}
                onChange={(e) => setTempPrefermento(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Usata per il calcolo del lievito nel prefermento
              </p>
            </div>
          </>
        )}
      </div>

      {/* Schedule info — clickable, opens drawer in-place */}
      <button
        onClick={() => setScheduleDrawerOpen(true)}
        className="w-full bg-card rounded-2xl p-4 shadow-sm text-left hover:bg-primary/5 transition-colors active:scale-[0.98]"
      >
        <p className="text-xs font-semibold text-primary uppercase tracking-wide text-center mb-3">
          🍽️ Quando vuoi mangiare — clicca per modificare
        </p>
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Inizia preparazione</p>
              <p className="text-sm font-bold text-primary">
                {format(startTime, "EEE d MMM, HH:mm", { locale: it })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Durata</p>
              <p className="text-xs font-bold text-foreground">
                {Math.floor(processDuration)}h
                {Math.round((processDuration - Math.floor(processDuration)) * 60) > 0
                  ? ` ${Math.round((processDuration - Math.floor(processDuration)) * 60)}m`
                  : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase">Mangio</p>
              <p className="text-sm font-bold text-foreground">
                {format(endTime, "EEE d MMM, HH:mm", { locale: it })}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-primary/60 text-center mt-2">Tocca per modificare ☝️</p>
        </div>
        {startTime.getTime() < Date.now() && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mt-3">
            <p className="text-[11px] text-destructive leading-relaxed">
              ⚠️ Durata del processo non compatibile con la data/ora di consumazione selezionata.
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
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Idratazione</p>
            <span className="text-sm font-bold text-primary">{idratazione}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={1}
            value={idratazione}
            onChange={(e) => setIdratazione(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {/* Percentages */}
        {[
          { label: "Sale %", value: salePercent, set: setSalePercent, max: 5, step: 0.1 },
          { label: "Olio %", value: olioPercent, set: setOlioPercent, max: 15, step: 0.5 },
          { label: "Malto %", value: maltoPercent, set: setMaltoPercent, max: 3, step: 0.1 },
        ].map(({ label, value, set, max, step }) => (
          <div key={label}>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <span className="text-xs font-bold text-primary">{value}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={max}
              step={step}
              value={value}
              onChange={(e) => set(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        ))}


        {/* Pasta di riporto */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pasta di riporto</p>
            <span className="text-sm font-bold text-primary">{pastaDiRiporto}g</span>
          </div>
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={pastaDiRiporto}
            onChange={(e) => setPastaDiRiporto(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      {/* Farine — in basso */}
      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Farine</p>
        <div className="flex gap-2">
          <button
            onClick={() => setFlourMode("mono")}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
              flourMode === "mono"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            Monofarina
          </button>
          <button
            onClick={() => setFlourMode("mix")}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
              flourMode === "mix"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            Mix di farine
          </button>
        </div>
        {flourMode === "mono" ? (
          <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
            <p className="text-xs text-muted-foreground">
              W consigliato: <span className="font-bold text-accent text-lg">{wConsigliato}</span>
              <span className="text-[10px] ml-1">per {maturationHours}h di maturazione</span>
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
        <ArrowLeft className="h-5 w-5 mr-2" /> Torna alla ricetta
      </Button>
    </section>
  );
};

export default AdvancedOptions;
