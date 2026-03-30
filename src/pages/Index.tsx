import { useState, useMemo, useEffect, useCallback } from "react";
import { BookOpen, Scale, ListOrdered, Globe, User, LogOut, BookOpenCheck, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { saveRecipeToDb, fetchRecipeById, rowToState, type RecipeFormState } from "@/lib/recipes-api";
import { toast } from "@/hooks/use-toast";
import heroDough from "@/assets/hero-dough.jpg";
import DoughCalculator from "@/components/DoughCalculator";
import AdvancedOptions from "@/components/AdvancedOptions";
import ScheduleDrawer from "@/components/ScheduleDrawer";
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

let tegliaNextId = 2;

const getDefaultScheduleDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

const Index = () => {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: "ricetta", label: t("tab.ricetta"), icon: BookOpen },
    { id: "dosi", label: t("tab.dosi"), icon: Scale },
    { id: "processo", label: t("tab.processo"), icon: ListOrdered },
  ];
  const [activeView, setActiveView] = useState<View>("ricetta");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<MaturationMode>("quando_mangio");

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
  // Drawer editing buffer
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(getDefaultScheduleDate);
  const [scheduleHour, setScheduleHour] = useState(20);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  // Independent start/end times
  const [scheduleStartTime, setScheduleStartTime] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(14, 0, 0, 0);
    return d;
  });
  const [scheduleEndTime, setScheduleEndTime] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(20, 0, 0, 0);
    return d;
  });
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
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveRecipeName, setSaveRecipeName] = useState("");

  // Apply recipe defaults
  useEffect(() => {
    const r = RECIPES[recipe];
    setIdratazione(r.defaultIdratazione);
    setSalePercent(r.salePercent);
    setOlioPercent(r.olioPercent);
    setMaltoPercent(r.maltoPercent);
    setYeastType(r.defaultYeastType);
  }, [recipe]);

  // Load recipe from URL param
  useEffect(() => {
    const loadId = searchParams.get("load");
    if (!loadId) return;
    fetchRecipeById(loadId).then(({ data }) => {
      if (!data) return;
      const s = rowToState(data);
      applyRecipeState(s);
      setSearchParams({}, { replace: true });
      toast({ title: t("myrecipes.loaded") });
    });
  }, []);

  const applyRecipeState = (s: RecipeFormState) => {
    setRecipe(s.recipe);
    setNumPanetti(s.numPanetti);
    setPesoPanetto(s.pesoPanetto);
    setIdratazione(s.idratazione);
    setYeastType(s.yeastType);
    setLmIdratazione(s.lmIdratazione);
    setMaturationHours(s.maturationHours);
    setSalePercent(s.salePercent);
    setOlioPercent(s.olioPercent);
    setMaltoPercent(s.maltoPercent);
    setTeglie(s.teglie);
    setPoolishPercent(s.poolishPercent);
    setPoolishMaturationHours(s.poolishMaturationHours);
    setPrefermentoType(s.prefermentoType);
    setTempPrefermento(s.tempPrefermento);
    setPastaDiRiporto(s.pastaDiRiporto);
    setPastaDiRiportoIdratazione(s.pastaDiRiportoIdratazione);
    setFermoFrigoHours(s.fermoFrigoHours);
    setAutolisiHours(s.autolisiHours);
    setTAmbiente(s.tAmbiente);
    setFlourMode(s.flourMode);
    setFlours(s.flours);
    setLmPercent(s.lmPercent);
    setLmCustomActive(s.lmCustomActive);
    setBreadCustom(s.breadCustom);
    setBreadCustomWeight(s.breadCustomWeight);
    setMixingMethod(s.mixingMethod);
    setMaturationMode(s.maturationMode);
    if (s.scheduleDate) setScheduleDate(s.scheduleDate);
    setScheduleHour(s.scheduleHour);
    setScheduleMinute(s.scheduleMinute);
  };

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
  const openScheduleDrawer = useCallback((mode: MaturationMode) => {
    setDrawerMode(mode);
    const source = mode === "quando_inizio" ? scheduleStartTime : scheduleEndTime;
    const d = new Date(source);
    d.setHours(0, 0, 0, 0);
    setScheduleDate(d);
    setScheduleHour(source.getHours());
    setScheduleMinute(source.getMinutes());
    setDrawerOpen(true);
  }, [scheduleStartTime, scheduleEndTime]);

  const handleDrawerClose = useCallback((open: boolean) => {
    if (!open && scheduleDate) {
      const newTime = new Date(scheduleDate);
      newTime.setHours(scheduleHour, scheduleMinute, 0, 0);
      if (drawerMode === "quando_inizio") {
        setScheduleStartTime(newTime);
        // Recalculate endTime = newStart + maturationHours
        setScheduleEndTime(new Date(newTime.getTime() + maturationHours * 3600000));
        setMaturationMode("quando_inizio");
      } else {
        setScheduleEndTime(newTime);
        // Keep maturationHours constant, recalculate startTime backwards
        setScheduleStartTime(new Date(newTime.getTime() - maturationHours * 3600000));
        setMaturationMode("quando_mangio");
      }
    }
    setDrawerOpen(open);
  }, [scheduleDate, scheduleHour, scheduleMinute, drawerMode, maturationHours, scheduleStartTime]);

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

  const getCurrentFormState = (): RecipeFormState => ({
    recipe, numPanetti, pesoPanetto, idratazione, yeastType, lmIdratazione,
    maturationHours, salePercent, olioPercent, maltoPercent, teglie,
    poolishPercent, poolishMaturationHours, prefermentoType, tempPrefermento,
    pastaDiRiporto, pastaDiRiportoIdratazione, fermoFrigoHours, autolisiHours,
    tAmbiente, flourMode, flours, lmPercent, lmCustomActive, breadCustom,
    breadCustomWeight, mixingMethod, maturationMode, scheduleDate, scheduleHour, scheduleMinute,
  });

  const saveRecipe = useCallback(async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowSaveDialog(true);
    setSaveRecipeName(`${t("save.ricetta")} - ${format(new Date(), "dd/MM HH:mm")}`);
  }, [user, navigate, t]);

  const confirmSaveRecipe = useCallback(async () => {
    if (!user) return;
    setSavingRecipe(true);
    const state = getCurrentFormState();
    const { error } = await saveRecipeToDb(saveRecipeName, state, user.id);
    setSavingRecipe(false);
    setShowSaveDialog(false);
    if (error) {
      toast({ title: t("save.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("save.success") });
    }
  }, [user, saveRecipeName]);

  // When maturationHours changes (from slider in advanced), update endTime
  const handleSetMaturationHours = useCallback((h: number) => {
    setMaturationHours(h);
    setScheduleEndTime(new Date(scheduleStartTime.getTime() + h * 3600000));
  }, [scheduleStartTime]);

  const handleNavigate = useCallback((view: string) => {
    if (view === "avanzate") {
      // Sync maturationHours from current schedule duration
      const durationH = Math.round((scheduleEndTime.getTime() - scheduleStartTime.getTime()) / 3600000);
      if (durationH > 0) setMaturationHours(durationH);
    }
    setActiveView(view as View);
  }, [scheduleStartTime, scheduleEndTime]);

  const activeTab: Tab = activeView === "avanzate" ? "ricetta" : (activeView as Tab);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="relative h-36 overflow-hidden flex-shrink-0">
        <img
          src={heroDough}
          alt={lang === "it" ? "Impasto per pizza su tagliere di legno con farina" : "Pizza dough on a wooden board with flour"}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 to-foreground/70 flex flex-col justify-end p-4">
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "it" ? "en" : "it")}
              className="flex items-center gap-1 bg-background/20 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-background/40 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "it" ? "EN" : "IT"}
            </button>
            {user ? (
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-1 bg-background/20 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-background/40 transition-colors"
              >
                <User className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1 bg-background/20 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-background/40 transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                {t("auth.login")}
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground leading-tight text-center">
            {t("app.title")}
          </h1>
          <p className="text-primary-foreground/80 text-xs mt-0.5 text-center">
            {t("app.subtitle")}
          </p>
        </div>
      </header>

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-foreground/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 shadow-xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold">{t("save.btn")}</h3>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">{t("save.name_prompt")}</label>
              <input
                type="text"
                value={saveRecipeName}
                onChange={(e) => setSaveRecipeName(e.target.value)}
                className="w-full mt-1 bg-secondary rounded-xl px-3 py-2 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSaveDialog(false)} className="flex-1 py-2 rounded-xl text-sm font-medium bg-secondary text-secondary-foreground">
                {t("proc.annulla")}
              </button>
              <button onClick={confirmSaveRecipe} disabled={savingRecipe || !saveRecipeName.trim()} className="flex-1 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-1">
                {savingRecipe ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t("btn.conferma")}
              </button>
            </div>
          </div>
        </div>
      )}

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
            tAmbiente={tAmbiente} setTAmbiente={setTAmbiente}
            breadCustom={breadCustom} setBreadCustom={setBreadCustom}
            breadCustomWeight={breadCustomWeight} setBreadCustomWeight={setBreadCustomWeight}
            result={result} input={input}
            scheduleStartTime={scheduleStartTime}
            scheduleEndTime={scheduleEndTime}
            onOpenScheduleDrawer={openScheduleDrawer}
            onNavigate={handleNavigate}
            onSave={saveRecipe}
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
            maturationHours={maturationHours} setMaturationHours={handleSetMaturationHours}
            tAmbiente={tAmbiente} setTAmbiente={setTAmbiente}
            input={input}
            result={result}
            startTime={scheduleStartTime}
            endTime={scheduleEndTime}
            onOpenScheduleDrawer={openScheduleDrawer}
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

        <ScheduleDrawer
          open={drawerOpen}
          onOpenChange={handleDrawerClose}
          maturationMode={drawerMode}
          scheduleDate={scheduleDate}
          setScheduleDate={setScheduleDate}
          scheduleHour={scheduleHour}
          setScheduleHour={setScheduleHour}
          scheduleMinute={scheduleMinute}
          setScheduleMinute={setScheduleMinute}
          otherTime={drawerMode === "quando_inizio" ? scheduleEndTime : scheduleStartTime}
        />
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
