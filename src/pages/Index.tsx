import { useState, useMemo, useEffect, useCallback } from "react";
import { BookOpen, Scale, ListOrdered, Globe } from "lucide-react";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n";
import heroDough from "@/assets/hero-dough.jpg";
import DoughCalculator from "@/components/DoughCalculator";
import AdvancedOptions from "@/components/AdvancedOptions";
import DoughResults from "@/components/DoughResults";
import ProcessTimeline from "@/components/ProcessTimeline";
import RisingTimer from "@/components/RisingTimer";
import {
  calculateDough,
  getProcessDuration,
  RECIPES,
  TEGLIA_COEFF,
  type DoughInput,
  type RecipeType,
  type YeastType,
  type MixingMethod,
  type PrefermentoType,
} from "@/lib/dough-calculator";
import type { FlourItem } from "@/components/DoughCalculator";

export interface Teglia {
  id: number;
  shape: "rettangolare" | "rotonda";
  width: number;
  height: number;
  diameter: number;
}

export type MaturationMode = "quando_inizio" | "quando_mangio";

type View = "ricetta" | "avanzate" | "dosi" | "processo";
type Tab = "ricetta" | "dosi" | "processo";

const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "ricetta", label: "Ricetta", icon: BookOpen },
  { id: "dosi", label: "Dosi", icon: Scale },
  { id: "processo", label: "Processo", icon: ListOrdered },
];

let tegliaNextId = 2;

const getDefaultScheduleDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

const Index = () => {
  const [activeView, setActiveView] = useState<View>("ricetta");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── All calculator state ──
  const [recipe, setRecipe] = useState<RecipeType>("napoletana");
  const [numPanetti, setNumPanetti] = useState(4);
  const [pesoPanetto, setPesoPanetto] = useState(250);
  const [teglie, setTeglie] = useState<Teglia[]>([
    { id: 1, shape: "rettangolare", width: 35, height: 42, diameter: 30 },
  ]);
  const [idratazione, setIdratazione] = useState(66);
  const [yeastType, setYeastType] = useState<YeastType>("LDB");
  const [lmIdratazione, setLmIdratazione] = useState<50 | 100>(50);
  const [maturationHours, setMaturationHours] = useState(6);
  const [maturationMode, setMaturationMode] = useState<MaturationMode>("quando_mangio");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(getDefaultScheduleDate);
  const [scheduleHour, setScheduleHour] = useState(20);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  const [tAmbiente, setTAmbiente] = useState(22);
  const [autolisiHours, setAutolisiHours] = useState(0);
  const [poolishPercent, setPoolishPercent] = useState(0);
  const [poolishMaturationHours, setPoolishMaturationHours] = useState(12);
  const [prefermentoType, setPrefermentoType] = useState<PrefermentoType>("poolish");
  const [tempPrefermento, setTempPrefermento] = useState(22);
  const [pastaDiRiporto, setPastaDiRiporto] = useState(0);
  const [pastaDiRiportoIdratazione, setPastaDiRiportoIdratazione] = useState(50);
  const [fermoFrigoHours, setFermoFrigoHours] = useState(0);
  const [salePercent, setSalePercent] = useState(3.0);
  const [olioPercent, setOlioPercent] = useState(0);
  const [maltoPercent, setMaltoPercent] = useState(0);
  const [lmPercent, setLmPercent] = useState(30);
  const [flourMode, setFlourMode] = useState<"mono" | "mix">("mono");
  const [flours, setFlours] = useState<FlourItem[]>([
    { id: 1, name: "Farina 1", w: 300, percent: 50 },
    { id: 2, name: "Farina 2", w: 200, percent: 50 },
  ]);
  const [breadCustom, setBreadCustom] = useState(false);
  const [breadCustomWeight, setBreadCustomWeight] = useState(1000);
  const [mixingMethod, setMixingMethod] = useState<MixingMethod>("manuale");
  const [lmCustomActive, setLmCustomActive] = useState(false);

  // Apply recipe defaults
  useEffect(() => {
    const r = RECIPES[recipe];
    setIdratazione(r.defaultIdratazione);
    setSalePercent(r.salePercent);
    setOlioPercent(r.olioPercent);
    setMaltoPercent(r.maltoPercent);
    setYeastType(r.defaultYeastType);
  }, [recipe]);

  // Teglia calculations
  const currentTegliaCoeff = RECIPES[recipe].tegliaCoeff ?? TEGLIA_COEFF;

  const tegliaDetails = useMemo(() => {
    return teglie.map((t) => {
      const area =
        t.shape === "rotonda"
          ? Math.round(Math.PI * (t.diameter / 2) ** 2)
          : t.width * t.height;
      return { ...t, area, weight: Math.round(area * currentTegliaCoeff) };
    });
  }, [teglie, currentTegliaCoeff]);

  const totalTegliaWeight = useMemo(
    () => tegliaDetails.reduce((s, t) => s + t.weight, 0),
    [tegliaDetails]
  );

  const isTeglia = recipe === "teglia_romana" || recipe === "focaccia_genovese";
  const isPane = recipe === "pane_classico";
  const effectiveNumPanetti = isTeglia ? 1 : numPanetti;
  const effectivePesoPanetto = isTeglia
    ? totalTegliaWeight
    : isPane
    ? breadCustom
      ? breadCustomWeight
      : 1000
    : pesoPanetto;

  const input: DoughInput = useMemo(
    () => ({
      recipe,
      numPanetti: effectiveNumPanetti,
      pesoPanetto: effectivePesoPanetto,
      idratazione,
      yeastType,
      lmIdratazione,
      maturationHours,
      fermoFrigoHours,
      tAmbiente,
      autolisiHours,
      poolishPercent,
      poolishMaturationHours,
      tempPrefermento,
      pastaDiRiporto,
      pastaDiRiportoIdratazione,
      prefermentoType,
      mixingMethod,
      customSale: salePercent,
      customOlio: olioPercent,
      customMalto: maltoPercent,
      customLmPercent: yeastType === "LM" && lmCustomActive ? lmPercent : undefined,
    }),
    [
      recipe, effectiveNumPanetti, effectivePesoPanetto, idratazione,
      yeastType, lmIdratazione, maturationHours, fermoFrigoHours, tAmbiente, autolisiHours,
      poolishPercent, poolishMaturationHours, tempPrefermento, pastaDiRiporto,
      pastaDiRiportoIdratazione, prefermentoType, salePercent, olioPercent, maltoPercent, lmPercent, lmCustomActive, mixingMethod,
    ]
  );

  const result = useMemo(() => calculateDough(input), [input]);
  const processDuration = useMemo(() => getProcessDuration(input, result), [input, result]);
  const { scheduleStartTime, scheduleEndTime } = useMemo(() => {
    const now = new Date();
    const scheduled = scheduleDate ? new Date(scheduleDate) : now;
    if (scheduleDate) {
      scheduled.setHours(scheduleHour, scheduleMinute, 0, 0);
    }
    const isInizio = maturationMode === "quando_inizio";
    const st = isInizio ? scheduled : new Date(scheduled.getTime() - processDuration * 3600 * 1000);
    const et = isInizio ? new Date(scheduled.getTime() + processDuration * 3600 * 1000) : scheduled;
    return { scheduleStartTime: st, scheduleEndTime: et };
  }, [scheduleDate, scheduleHour, scheduleMinute, maturationMode, processDuration]);

  const addTeglia = useCallback(() => {
    setTeglie((prev) => [
      ...prev,
      { id: tegliaNextId++, shape: "rettangolare", width: 30, height: 40, diameter: 30 },
    ]);
  }, []);

  const removeTeglia = useCallback((id: number) => {
    setTeglie((prev) => (prev.length <= 1 ? prev : prev.filter((t) => t.id !== id)));
  }, []);

  const updateTeglia = useCallback(
    (id: number, field: keyof Teglia, value: number | string) => {
      setTeglie((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    },
    []
  );

  const saveRecipe = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
    const name = `Ricetta ${saved.length + 1} - ${format(new Date(), "dd/MM HH:mm")}`;
    saved.push({
      name, recipe, numPanetti, pesoPanetto, teglie, idratazione, yeastType,
      lmIdratazione, maturationHours, autolisiHours, tAmbiente,
      poolishPercent, poolishMaturationHours, pastaDiRiporto, pastaDiRiportoIdratazione,
      salePercent, olioPercent, maltoPercent, lmPercent, flourMode, flours, prefermentoType,
    });
    localStorage.setItem("savedRecipes", JSON.stringify(saved));
    alert(`"${name}" salvata!`);
  }, [
    recipe, numPanetti, pesoPanetto, teglie, idratazione, yeastType,
    lmIdratazione, maturationHours, autolisiHours, tAmbiente,
    poolishPercent, poolishMaturationHours, pastaDiRiporto, pastaDiRiportoIdratazione,
    salePercent, olioPercent, maltoPercent, lmPercent, flourMode, flours, prefermentoType,
  ]);

  const handleNavigate = useCallback((view: string) => {
    setActiveView(view as View);
  }, []);


  const activeTab: Tab = activeView === "avanzate" ? "ricetta" : (activeView as Tab);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="relative h-36 overflow-hidden flex-shrink-0">
        <img
          src={heroDough}
          alt="Impasto per pizza su tagliere di legno con farina"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 to-foreground/70 flex flex-col justify-end p-4">
          <h1 className="text-2xl font-bold text-primary-foreground leading-tight text-center">
            Pizza Perfetta 🍕
          </h1>
          <p className="text-primary-foreground/80 text-xs mt-0.5 text-center">
            Calcolatore professionale per impasti
          </p>
        </div>
      </header>

      <main className="flex-1 pb-20">
        {activeView === "ricetta" && (
          <DoughCalculator
            recipe={recipe} setRecipe={setRecipe}
            numPanetti={numPanetti} setNumPanetti={setNumPanetti}
            pesoPanetto={pesoPanetto} setPesoPanetto={setPesoPanetto}
            teglie={teglie} tegliaDetails={tegliaDetails}
            totalTegliaWeight={totalTegliaWeight}
            addTeglia={addTeglia} removeTeglia={removeTeglia} updateTeglia={updateTeglia}
            idratazione={idratazione} setIdratazione={setIdratazione}
            maturationHours={maturationHours} setMaturationHours={setMaturationHours}
            maturationMode={maturationMode} setMaturationMode={setMaturationMode}
            scheduleDate={scheduleDate} setScheduleDate={setScheduleDate}
            scheduleHour={scheduleHour} setScheduleHour={setScheduleHour}
            scheduleMinute={scheduleMinute} setScheduleMinute={setScheduleMinute}
            tAmbiente={tAmbiente} setTAmbiente={setTAmbiente}
            breadCustom={breadCustom} setBreadCustom={setBreadCustom}
            breadCustomWeight={breadCustomWeight} setBreadCustomWeight={setBreadCustomWeight}
            result={result} input={input}
            drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}
            onNavigate={handleNavigate}
          />
        )}
        {activeView === "avanzate" && (
          <AdvancedOptions
            idratazione={idratazione} setIdratazione={setIdratazione}
            yeastType={yeastType} setYeastType={setYeastType}
            lmIdratazione={lmIdratazione} setLmIdratazione={setLmIdratazione}
            lmPercent={lmPercent} setLmPercent={setLmPercent}
            lmCustomActive={lmCustomActive} setLmCustomActive={setLmCustomActive}
            flourMode={flourMode} setFlourMode={setFlourMode}
            flours={flours} setFlours={setFlours}
            autolisiHours={autolisiHours} setAutolisiHours={setAutolisiHours}
            salePercent={salePercent} setSalePercent={setSalePercent}
            olioPercent={olioPercent} setOlioPercent={setOlioPercent}
            maltoPercent={maltoPercent} setMaltoPercent={setMaltoPercent}
            poolishPercent={poolishPercent} setPoolishPercent={setPoolishPercent}
            poolishMaturationHours={poolishMaturationHours} setPoolishMaturationHours={setPoolishMaturationHours}
            tempPrefermento={tempPrefermento} setTempPrefermento={setTempPrefermento}
            prefermentoType={prefermentoType} setPrefermentoType={setPrefermentoType}
            pastaDiRiporto={pastaDiRiporto} setPastaDiRiporto={setPastaDiRiporto}
            pastaDiRiportoIdratazione={pastaDiRiportoIdratazione} setPastaDiRiportoIdratazione={setPastaDiRiportoIdratazione}
            fermoFrigoHours={fermoFrigoHours} setFermoFrigoHours={setFermoFrigoHours}
            maturationHours={maturationHours} setMaturationHours={setMaturationHours}
            input={input}
            result={result}
            startTime={scheduleStartTime}
            endTime={scheduleEndTime}
            processDuration={processDuration}
            maturationMode={maturationMode} setMaturationMode={setMaturationMode}
            scheduleDate={scheduleDate} setScheduleDate={setScheduleDate}
            scheduleHour={scheduleHour} setScheduleHour={setScheduleHour}
            scheduleMinute={scheduleMinute} setScheduleMinute={setScheduleMinute}
            onNavigate={handleNavigate}
            onSave={saveRecipe}
          />
        )}
        {activeView === "dosi" && (
          <DoughResults
            input={input}
            tAmbiente={tAmbiente}
            flourMode={flourMode}
            flours={flours}
            mixingMethod={mixingMethod}
            setMixingMethod={setMixingMethod}
            prefermentoType={prefermentoType}
          />
        )}
        {activeView === "processo" && (
          <ProcessTimeline
            input={input}
            maturationMode={maturationMode}
            scheduleDate={scheduleDate}
            scheduleHour={scheduleHour}
            scheduleMinute={scheduleMinute}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50">
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
