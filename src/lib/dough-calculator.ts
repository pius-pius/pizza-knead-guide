/**
 * ============================================================
 * MOTORE DI CALCOLO IMPASTO
 * Basato su: "Procedimento di calcolo ricetta (PDR, PRE, LM, LDB) v2.1"
 * ============================================================
 *
 * Il modello risolve in forma chiusa il sistema farina/acqua
 * a partire dal peso impasto target, usando:
 *   - PDR  (Pasta Di Riporto)
 *   - PRE  (Prefermento / Poolish)
 *   - LM   (Lievito Madre)
 *   - LDB  (Lievito Di Birra)
 *   - Ingredienti percentuali (sale, olio, malto…)
 *
 * Convenzione: tutte le percentuali interne sono frazioni (60% → 0.60).
 * I campi di input dall'UI sono in percentuale (60) e convertiti qui.
 *
 * PARAMETRI CONFIGURABILI: cerca "⚙️ CONFIGURABILE" nel codice.
 */

// ============================================================
// TIPI
// ============================================================

export type RecipeType =
  | "napoletana"
  | "teglia_romana"
  | "pane_classico"
  | "focaccia_genovese"
  | "napoletana_contemporanea";

export type YeastType = "LDB" | "LM";

export type MixingMethod = "manuale" | "forcella" | "spirale" | "braccia_tuffanti";

export type PrefermentoType = "poolish" | "biga";

// ============================================================
// ⚙️ CONFIGURABILE — Coefficiente teglia (g per cm²)
// ============================================================
/** Peso impasto = area_teglia_cm2 * TEGLIA_COEFF */
export const TEGLIA_COEFF = 0.625; // g/cm² (da documento tecnico)

// ============================================================
// ⚙️ CONFIGURABILE — Formula LDB su acqua totale
// ============================================================
/**
 * p_LDB = (LDB_K1 / ore_lievitazione) * LDB_K2 * (LDB_K3 / T_amb) * LDB_K4
 *
 * Default dal documento: (8/ore) * 4.5 * (20/T_amb) * (1/1000)
 */
//export const LDB_K1 = 8;
//export const LDB_K2 = 4.5;
//export const LDB_K3 = 20;
//export const LDB_K4 = 1 / 1000;

//export function calcLdbFraction(oreLievitazione: number, tAmbiente: number): number {
//  if (oreLievitazione <= 0 || tAmbiente <= 0) return 0;
//  return (LDB_K1 / oreLievitazione) * LDB_K2 * (LDB_K3 / tAmbiente) * LDB_K4;
//}

// ============================================================
// ⚙️ CONFIGURABILE — Formula LM / LICOLI
// ============================================================
/**
 * Calcola la % di Lievito Madre sulla farina totale
 *
 * LM solido (idratazione ~50%):
 *   pct = (1.8 / ore_liev_finale) * (20 / T_amb)
 *   clamp: 0.10 – 0.30
 *
 * LICOLI (idratazione ~100%):
 *   pct = (2.4 / ore_liev_finale) * (20 / T_amb)
 *   clamp: 0.15 – 0.40
 */
export const LM_PARAMS = {
  solido: { k: 1.8, min: 0.02, max: 0.3 },
  licoli: { k: 2.4, min: 0.03, max: 0.4 },
} as const;

export type LievMadreType = "solido" | "licoli";

export function calcLievMadreFraction(type: LievMadreType, oreLievitazione: number, tAmbiente: number): number {
  if (oreLievitazione <= 0 || tAmbiente <= 0) return 0;
  const p = LM_PARAMS[type];
  const pct = (p.k / oreLievitazione) * (20 / tAmbiente);
  return Math.max(p.min, Math.min(p.max, pct));
}

// ============================================================
// ⚙️ CONFIGURABILE — Calore apportato dal metodo di impasto (°C)
// ============================================================
export const MIXING_HEAT: Record<MixingMethod, number> = {
  manuale: 2,
  forcella: 4.5,
  braccia_tuffanti: 9,
  spirale: 15,
};

export const MIXING_METHOD_LABELS: Record<MixingMethod, string> = {
  manuale: "Manuale",
  forcella: "Forcella",
  braccia_tuffanti: "Braccia tuffanti",
  spirale: "Spirale",
};

// ============================================================
// ⚙️ CONFIGURABILE — Temperatura desiderata impasto (°C) in funzione dell'idratazione
// ============================================================
/** Restituisce T desiderata dell'impasto in base all'idratazione % */
export function getDesiredTemp(hydrationPercent: number): number {
  if (hydrationPercent <= 55) return 23;
  if (hydrationPercent <= 60) return 24;
  if (hydrationPercent <= 65) return 25;
  if (hydrationPercent <= 70) return 26;
  if (hydrationPercent <= 75) return 27;
  if (hydrationPercent <= 80) return 27;
  return 28;
}

// ============================================================
// ⚙️ CONFIGURABILE — Tabella W / Ore maturazione
// ============================================================
export const W_HOURS_TABLE: { hours: number; w: number }[] = [
  { hours: 1.1, w: 90 },
  { hours: 1.3, w: 100 },
  { hours: 1.4, w: 110 },
  { hours: 1.6, w: 120 },
  { hours: 1.9, w: 130 },
  { hours: 2.1, w: 140 },
  { hours: 2.4, w: 150 },
  { hours: 2.7, w: 160 },
  { hours: 3.1, w: 170 },
  { hours: 3.5, w: 180 },
  { hours: 4.0, w: 190 },
  { hours: 4.6, w: 200 },
  { hours: 5.2, w: 210 },
  { hours: 5.9, w: 220 },
  { hours: 6.7, w: 230 },
  { hours: 7.6, w: 240 },
  { hours: 8.6, w: 250 },
  { hours: 9.8, w: 260 },
  { hours: 11.1, w: 270 },
  { hours: 12.6, w: 280 },
  { hours: 14.3, w: 290 },
  { hours: 16.3, w: 300 },
  { hours: 18.5, w: 310 },
  { hours: 21.0, w: 320 },
  { hours: 23.8, w: 330 },
  { hours: 27.1, w: 340 },
  { hours: 30.7, w: 350 },
  { hours: 34.9, w: 360 },
  { hours: 39.6, w: 370 },
  { hours: 45.0, w: 380 },
  { hours: 51.1, w: 390 },
  { hours: 58.0, w: 400 },
  { hours: 66.0, w: 410 },
  { hours: 74.9, w: 420 },
  { hours: 85.1, w: 430 },
  { hours: 96.6, w: 440 },
  { hours: 109.8, w: 450 },
  { hours: 124.7, w: 460 },
  { hours: 141.6, w: 470 },
  { hours: 160.8, w: 480 },
  { hours: 182.7, w: 490 },
  { hours: 207.5, w: 500 },
];

// ============================================================
// ⚙️ CONFIGURABILE — Preset ricette
// ============================================================
export interface Recipe {
  name: string;
  /** % lievito madre sulla farina (0 = non usato) */
  lmPercent: number;
  /** % sale sulla farina totale */
  salePercent: number;
  /** % olio sulla farina totale */
  olioPercent: number;
  /** % malto sulla farina totale */
  maltoPercent: number;
  /** Idratazione % default per questa ricetta */
  defaultIdratazione: number;
  /** Tipo di lievito default */
  defaultYeastType: YeastType;
  /** Coefficiente di teglia (opzionale) */
  tegliaCoeff?: number;
}

export const RECIPES: Record<RecipeType, Recipe> = {
  napoletana: {
    name: "Pizza Napoletana",
    lmPercent: 0,
    salePercent: 3.0,
    olioPercent: 0,
    maltoPercent: 0,
    defaultIdratazione: 66,
    defaultYeastType: "LDB",
  },
  teglia_romana: {
    name: "Pizza in Teglia",
    lmPercent: 0,
    salePercent: 2.5,
    olioPercent: 2.0,
    maltoPercent: 0,
    defaultIdratazione: 75,
    defaultYeastType: "LDB",
    tegliaCoeff: 0.625,
  },
  pane_classico: {
    name: "Pane Classico",
    lmPercent: 0,
    salePercent: 3.0,
    olioPercent: 2.0,
    maltoPercent: 0,
    defaultIdratazione: 65,
    defaultYeastType: "LDB",
  },
  focaccia_genovese: {
    name: "Focaccia Genovese",
    lmPercent: 0,
    salePercent: 2.5,
    olioPercent: 5.0,
    maltoPercent: 0,
    defaultIdratazione: 60,
    defaultYeastType: "LDB",
    tegliaCoeff: 0.7,
  },
  napoletana_contemporanea: {
    name: "Napoletana Contemp.",
    lmPercent: 0,
    salePercent: 3.0,
    olioPercent: 0,
    maltoPercent: 0,
    defaultIdratazione: 72,
    defaultYeastType: "LDB",
  },
};

// ============================================================
// ⚙️ CONFIGURABILE — Idratazione default del poolish (prefermento)
// ============================================================
export const DEFAULT_POOLISH_HYDRATION = 100; // % (100% = pari peso farina e acqua)

// ============================================================
// ⚙️ CONFIGURABILE — Parametri prefermenti (Biga / Poolish)
// ============================================================
export const PREFERMENTO_PARAMS = {
  poolish: {
    H: 1.0,
    T_ref: 20,
    t_ref: 12,
    Y_ref: 0.0015,
    k: 0.1,
    P_center: 0.3,
    P_slope: 0.4,
    minHours: 8,
    maxHours: 16,
    Y_min: 0.0003,
    Y_max: 0.004,
  },
  biga: {
    H: 0.45,
    T_ref: 18,
    t_ref: 18,
    Y_ref: 0.01,
    k: 0.08,
    P_center: 0.4,
    P_slope: 0.35,
    minHours: 12,
    maxHours: 24,
    Y_min: 0.001,
    Y_max: 0.015,
  },
} as const;

export function calcPrefermentoYeast(type: PrefermentoType, tempPref: number, tPref: number, pPref: number): number {
  const p = PREFERMENTO_PARAMS[type];
  const cPref = Math.max(0.85, Math.min(1.1, 1 - p.P_slope * (pPref - p.P_center)));
  const y = p.Y_ref * (p.t_ref / tPref) * Math.exp(-p.k * (tempPref - p.T_ref)) * cPref;
  return Math.max(p.Y_min, Math.min(p.Y_max, y));
}

// ============================================================
// ⚙️ CALCOLO LDB FINALE — preferment-aware
// ============================================================

export type DoughMethod = "diretto" | "biga" | "poolish";

export interface FinalYeastInput {
  doughMethod: DoughMethod;
  totalFlourG: number;
  totalWaterG: number;
  finalProofHoursAmb: number;
  ambientTempC: number;
  doughTempC?: number;
  usesFridge: boolean;
  fridgeHours: number;
  fridgeTempC?: number;
  prefermentedFlourPct?: number; // 0..1, only for biga/poolish
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculates grams of fresh yeast (LDB) to add in the final dough stage.
 * Does NOT include yeast already in the preferment.
 */
export function calcFinalDoughFreshYeast(params: FinalYeastInput): number {
  // --- Validation ---
  if (params.totalFlourG <= 0) throw new Error("totalFlourG must be > 0");
  if (params.finalProofHoursAmb <= 0) throw new Error("finalProofHoursAmb must be > 0");
  if (params.totalWaterG < 0) throw new Error("totalWaterG must be >= 0");

  const effectiveTempC = params.doughTempC ?? params.ambientTempC;
  if (effectiveTempC == null || effectiveTempC <= 0) {
    throw new Error("A valid doughTempC or ambientTempC is required");
  }

  const {
    doughMethod,
    totalFlourG,
    totalWaterG,
    finalProofHoursAmb,
    ambientTempC,
    doughTempC,
    usesFridge,
    fridgeHours: rawFridgeHours,
    prefermentedFlourPct = 0,
  } = params;

  if ((doughMethod === "biga" || doughMethod === "poolish") && (prefermentedFlourPct < 0 || prefermentedFlourPct > 1)) {
    throw new Error("prefermentedFlourPct must be between 0 and 1");
  }

  const fridgeHours = usesFridge ? rawFridgeHours : 0;

  // --- 1. Direct dough baseline (baker's % on flour) ---
  const Y_ref = 0.002; // 0.20% on flour
  const t_ref = 8; // hours
  const T_ref = 24; // °C

  const yeastPctOnFlour = Y_ref * (t_ref / finalProofHoursAmb) * Math.pow(2, (T_ref - effectiveTempC) / 4);

  const yeastPctClamped = clamp(yeastPctOnFlour, 0.0001, 0.03);

  const baseYeastG = totalFlourG * yeastPctClamped;

  // --- 2. Preferment reduction factor ---
  let prefermentReductionFactor = 1.0;
  if (doughMethod === "biga") {
    prefermentReductionFactor = 1 - 0.9 * prefermentedFlourPct;
  }
  if (doughMethod === "poolish") {
    prefermentReductionFactor = 1 - 1.0 * prefermentedFlourPct;
  }
  prefermentReductionFactor = clamp(prefermentReductionFactor, 0.1, 1.0);

  // --- 3. Fridge correction factor ---
  let fridgeCorrectionFactor = 1.0;
  if (usesFridge) {
    fridgeCorrectionFactor = 1 / (1 + 0.04 * fridgeHours);
  }
  fridgeCorrectionFactor = clamp(fridgeCorrectionFactor, 0.35, 1.0);

  // --- 4. Compute final yeast ---
  let finalYeastG = baseYeastG * prefermentReductionFactor * fridgeCorrectionFactor;


  // --- 6. Absolute safety clamps ---
  if (doughMethod === "diretto") {
    finalYeastG = clamp(finalYeastG, 0, totalFlourG * 0.03);
  } else {
    finalYeastG = clamp(finalYeastG, 0, totalFlourG * 0.01);
  }

  return finalYeastG;
}

// ============================================================
// UTILITY: lookup W ↔ ore
// ============================================================

export function getWForHours(hours: number): number {
  if (hours <= W_HOURS_TABLE[0].hours) return W_HOURS_TABLE[0].w;
  if (hours >= W_HOURS_TABLE[W_HOURS_TABLE.length - 1].hours) return W_HOURS_TABLE[W_HOURS_TABLE.length - 1].w;
  for (let i = 0; i < W_HOURS_TABLE.length - 1; i++) {
    if (hours >= W_HOURS_TABLE[i].hours && hours <= W_HOURS_TABLE[i + 1].hours) {
      const ratio = (hours - W_HOURS_TABLE[i].hours) / (W_HOURS_TABLE[i + 1].hours - W_HOURS_TABLE[i].hours);
      return Math.round(W_HOURS_TABLE[i].w + ratio * (W_HOURS_TABLE[i + 1].w - W_HOURS_TABLE[i].w));
    }
  }
  return 300;
}

export function getHoursForW(w: number): number {
  if (w <= W_HOURS_TABLE[0].w) return W_HOURS_TABLE[0].hours;
  if (w >= W_HOURS_TABLE[W_HOURS_TABLE.length - 1].w) return W_HOURS_TABLE[W_HOURS_TABLE.length - 1].hours;
  for (let i = 0; i < W_HOURS_TABLE.length - 1; i++) {
    if (w >= W_HOURS_TABLE[i].w && w <= W_HOURS_TABLE[i + 1].w) {
      const ratio = (w - W_HOURS_TABLE[i].w) / (W_HOURS_TABLE[i + 1].w - W_HOURS_TABLE[i].w);
      return (
        Math.round((W_HOURS_TABLE[i].hours + ratio * (W_HOURS_TABLE[i + 1].hours - W_HOURS_TABLE[i].hours)) * 10) / 10
      );
    }
  }
  return 18.5;
}

// ============================================================
// UTILITY: persone consigliate
// ============================================================

/** ⚙️ CONFIGURABILE — grammi impasto per persona */
const GRAMMI_PER_PERSONA = 250;

export function calculatePersone(totalWeight: number): number {
  return Math.round(totalWeight / GRAMMI_PER_PERSONA);
}

// ============================================================
// UTILITY: miscela farine
// ============================================================

export interface FlourMix {
  name: string;
  w: number;
  weight: number;
}

export function calculateMixW(flours: FlourMix[]): number {
  const totalWeight = flours.reduce((s, f) => s + f.weight, 0);
  if (totalWeight === 0) return 0;
  return Math.round(flours.reduce((s, f) => s + f.w * f.weight, 0) / totalWeight);
}

export function calculateFlourWeightsForTargetW(
  totalFlourNeeded: number,
  flour1W: number,
  flour2W: number,
  targetW: number,
): { flour1: number; flour2: number } {
  if (flour1W === flour2W) return { flour1: totalFlourNeeded, flour2: 0 };
  const flour1 = Math.round((totalFlourNeeded * (targetW - flour2W)) / (flour1W - flour2W));
  const flour2 = totalFlourNeeded - flour1;
  return { flour1: Math.max(0, flour1), flour2: Math.max(0, flour2) };
}

// ============================================================
// INPUT / OUTPUT DEL MOTORE
// ============================================================

export interface DoughInput {
  recipe: RecipeType;
  numPanetti: number;
  pesoPanetto: number;
  /** Idratazione target % (es. 66) */
  idratazione: number;
  yeastType: YeastType;
  /** Idratazione del lievito madre % (50 = solido, 100 = licoli) */
  lmIdratazione: number;
  /** Ore di maturazione (per calcolo W consigliato) */
  maturationHours: number;
  /** Ore di fermo frigo (sottratte dalla maturazione per ottenere lievitazione) */
  fermoFrigoHours: number;
  /** Temperatura ambiente °C (per calcolo LDB) */
  tAmbiente: number;
  /** Ore di autolisi (influenza solo processo, non dosi) */
  autolisiHours: number;
  /** Poolish: % del peso impasto totale (0 = nessun poolish) */
  poolishPercent: number;
  /** Ore maturazione poolish */
  poolishMaturationHours: number;
  /** Pasta di riporto in grammi */
  pastaDiRiporto: number;
  /** Idratazione della pasta di riporto % */
  pastaDiRiportoIdratazione: number;
  /** Tipo di prefermento (poolish o biga) */
  prefermentoType: PrefermentoType;
  /** Temperatura del prefermento °C (se diversa da ambiente) */
  tempPrefermento?: number;

  /** Metodo di impasto (influenza il processo) */
  mixingMethod: MixingMethod;

  // Override opzionali (dall'UI "opzioni avanzate")
  customSale?: number; // % sulla farina totale
  customOlio?: number; // % sulla farina totale
  customMalto?: number; // % sulla farina totale
  customLmPercent?: number; // % LM sulla farina base
}

export interface DoughResult {
  /** Peso impasto totale (g) */
  totaleImpasto: number;
  /** Farina base da aggiungere (g) */
  farina: number;
  /** Acqua base da aggiungere (g) */
  acqua: number;
  /** Farina totale (base + contributi da PDR, PRE, LM) */
  farinaTotale: number;
  /** Acqua totale */
  acquaTotale: number;
  /** Sale (g) */
  sale: number;
  /** Olio (g) */
  olio: number;
  /** Malto (g) */
  malto: number;
  /** Lievito (g) — LDB o LM a seconda del tipo */
  lievito: number;
  yeastType: YeastType;
  /** Se LM: farina nel lievito madre (g) */
  lmFarina: number;
  /** Se LM: acqua nel lievito madre (g) */
  lmAcqua: number;
  /** Pasta di riporto usata (g) */
  pastaDiRiporto: number;
  /** W consigliato dalla tabella ore→W */
  wConsigliato: number;
  /** Poolish: farina (g) */
  poolishFarina: number;
  /** Poolish: acqua (g) */
  poolishAcqua: number;
  /** Poolish: lievito (g) */
  poolishLievito: number;
}

// ============================================================
// MOTORE PRINCIPALE — Risoluzione in forma chiusa
// (Riferimento: sezioni 1–9 del documento tecnico)
// ============================================================

export function calculateDough(input: DoughInput): DoughResult {
  const recipe = RECIPES[input.recipe];

  // --- Parametri effettivi (override o default ricetta) ---
  const salePercent = input.customSale ?? recipe.salePercent;
  const olioPercent = input.customOlio ?? recipe.olioPercent;
  const maltoPercent = input.customMalto ?? recipe.maltoPercent;
  const lmPercentInput = input.customLmPercent ?? recipe.lmPercent;

  // --- §1.1 Impasto target ---
  const impasto = input.numPanetti * input.pesoPanetto;

  // --- Converti % → frazioni ---
  const idro = input.idratazione / 100;
  const idro_LM = input.lmIdratazione / 100;

  // --- Calcola % LM base (senza ancora correggere per eventuale prefermento) ---
  let percLMBase = 0;
  const isLMAuto = input.yeastType === "LM" && !(input.customLmPercent !== undefined && input.customLmPercent > 0);

  if (input.yeastType === "LM") {
    if (input.customLmPercent !== undefined && input.customLmPercent > 0) {
      percLMBase = input.customLmPercent / 100;
    } else {
      const lmType: LievMadreType = idro_LM >= 0.8 ? "licoli" : "solido";
      const oreLievitazione = Math.max(1, input.maturationHours - (input.fermoFrigoHours || 0));
      percLMBase = calcLievMadreFraction(lmType, oreLievitazione, input.tAmbiente);
    }
  }

  let percLM = percLMBase;

  const idroPDR = input.pastaDiRiportoIdratazione / 100;
  const percPRE = input.poolishPercent / 100;
  const prefType = input.prefermentoType ?? "poolish";
  const idro_PRE = PREFERMENTO_PARAMS[prefType].H;

  // --- §1.3 Somma ingredienti percentuali (frazioni su farina totale) ---
  const s_i = (salePercent + olioPercent + maltoPercent) / 100;

  // --- §3.1 PDR: scomposizione farina/acqua ---
  const PDR = input.pastaDiRiporto;
  const farina_PDR = PDR > 0 ? PDR / (1 + idroPDR) : 0;
  const acqua_PDR = farina_PDR * idroPDR;

  // --- §3.2 PRE (poolish): quota sul totale ---
  const PRE = impasto * percPRE;
  const farina_PRE = PRE > 0 ? PRE / (1 + idro_PRE) : 0;
  const acqua_PRE = farina_PRE * idro_PRE;

  // --- §5 Coefficiente lineare acqua: acqua = k*farina + m ---
  const k = idro + (percLM * (idro - idro_LM)) / (1 + idro_LM);
  const m = idro * farina_PDR - acqua_PDR + (idro * farina_PRE - acqua_PRE);

  // --- §6 Ingredienti lineari: ingredienti = a*farina + b ---
  const a = s_i * (1 + percLM / (1 + idro_LM));
  const b = s_i * (farina_PDR + farina_PRE);

  // --- §7 LDB su acqua totale (solo se tipo LDB) ---
  // Lievitazione = maturazione − fermo frigo
  let c = 0,
    d = 0;
  // TOLTO IL BLOCCO SOTTO, LASCIANDO c,d=0  perché formula legacy. Ora il calcolo del LDB
  // lo prende dalla funzione apposita aggiornata

  //if (input.yeastType === "LDB") {
  //  const oreLievitazione = Math.max(1, input.maturationHours - (input.fermoFrigoHours || 0));
  //  const p_LDB = calcLdbFraction(oreLievitazione, input.tAmbiente);
  //  c = p_LDB * idro * (1 + percLM / (1 + idro_LM));
  //  d = p_LDB * idro * (farina_PDR + farina_PRE);
  //}

  // --- §8 Risoluzione farina (forma chiusa) ---
  const den = 1 + percLM + k + a + c;
  const num = impasto - (PDR + PRE + m + b + d);
  const farina_initial = Math.round(num / den);

  // --- §9 Output ---

  let k_eff = k;
  let a_eff = a;
  let farina_eff = farina_initial;
  let percLM_eff = percLM;

  // Primo calcolo provvisorio di farina totale
  let acqua_eff = Math.round(k_eff * farina_eff + m);
  let farina_LM_eff = percLM_eff > 0 ? farina_eff * (percLM_eff / (1 + idro_LM)) : 0;
  let acqua_LM_eff = percLM_eff > 0 ? farina_eff * ((percLM_eff * idro_LM) / (1 + idro_LM)) : 0;
  let farinaTotale_eff = farina_eff * (1 + percLM_eff / (1 + idro_LM)) + farina_PDR + farina_PRE;
  let acquaTotale_eff = acqua_eff + acqua_LM_eff + acqua_PDR + acqua_PRE;

  // Se LM automatico + prefermento presente, applica riduzione e ricalcola
  if (isLMAuto && PRE > 0 && farinaTotale_eff > 0) {
    const prefermentedFlourPct = farina_PRE / farinaTotale_eff;

    let prefermentCorrection = 1.0;
    if (prefType === "biga") {
      prefermentCorrection = 1 - 0.6 * prefermentedFlourPct;
    } else if (prefType === "poolish") {
      prefermentCorrection = 1 - 0.75 * prefermentedFlourPct;
    }

    percLM_eff = percLMBase * prefermentCorrection;

    const lmType: LievMadreType = idro_LM >= 0.8 ? "licoli" : "solido";
    const lmParams = LM_PARAMS[lmType];
    percLM_eff = Math.max(lmParams.min, Math.min(lmParams.max, percLM_eff));

    // Ricalcola k e a con la nuova % LM
    k_eff = idro + (percLM_eff * (idro - idro_LM)) / (1 + idro_LM);
    a_eff = s_i * (1 + percLM_eff / (1 + idro_LM));

    const den2 = 1 + percLM_eff + k_eff + a_eff + c;
    const num2 = impasto - (PDR + PRE + m + b + d);
    farina_eff = Math.round(num2 / den2);

    acqua_eff = Math.round(k_eff * farina_eff + m);
    farina_LM_eff = percLM_eff > 0 ? farina_eff * (percLM_eff / (1 + idro_LM)) : 0;
    acqua_LM_eff = percLM_eff > 0 ? farina_eff * ((percLM_eff * idro_LM) / (1 + idro_LM)) : 0;
    farinaTotale_eff = farina_eff * (1 + percLM_eff / (1 + idro_LM)) + farina_PDR + farina_PRE;
    acquaTotale_eff = acqua_eff + acqua_LM_eff + acqua_PDR + acqua_PRE;
  }

  const percLMFinal = percLM_eff;
  const farina = farina_eff;
  const acqua = acqua_eff;
  const LM = Math.round(farina * percLMFinal * 10) / 10;
  const farina_LM = farina_LM_eff;
  const acqua_LM = acqua_LM_eff;
  const farinaTotale = farinaTotale_eff;
  const acquaTotale = acquaTotale_eff;

  // Ingredienti singoli su farina totale (§6, §9)
  const sale = Math.round(((farinaTotale * salePercent) / 100) * 10) / 10;
  const olio = Math.round(((farinaTotale * olioPercent) / 100) * 10) / 10;
  const malto = Math.round(((farinaTotale * maltoPercent) / 100) * 10) / 10;

  // W consigliato
  const wConsigliato = getWForHours(input.maturationHours);

  // Poolish sub-ingredienti (per la scheda Dosi)
  // Il poolish è già contabilizzato nel bilancio come PRE;
  // qui calcoliamo i sotto-ingredienti per la presentazione.
  let poolishFarina = 0,
    poolishAcqua = 0,
    poolishLievito = 0;
  if (PRE > 0) {
    poolishFarina = Math.round(farina_PRE);
    poolishAcqua = Math.round(acqua_PRE);
    const pPref = farina_PRE / farinaTotale;
    const yeastFraction = calcPrefermentoYeast(prefType, input.tempPrefermento ?? input.tAmbiente, input.poolishMaturationHours, pPref);
    poolishLievito = Math.round(farina_PRE * yeastFraction * 100) / 100;
  }

  // LDB: usa calcFinalDoughFreshYeast (preferment-aware) al posto della formula legacy
  let ldb = 0;
  if (input.yeastType === "LDB") {
    const hasPrefermento = PRE > 0;
    const doughMethod: DoughMethod = hasPrefermento ? prefType : "diretto";
    const oreLievitazione = Math.max(1, input.maturationHours - (input.fermoFrigoHours || 0));
    const prefermentedFlourPct = hasPrefermento ? farina_PRE / farinaTotale : 0;

    const finalDoughYeastG = calcFinalDoughFreshYeast({
      doughMethod,
      totalFlourG: farinaTotale,
      totalWaterG: acquaTotale,
      finalProofHoursAmb: oreLievitazione,
      ambientTempC: input.tAmbiente,
      usesFridge: (input.fermoFrigoHours || 0) > 0,
      fridgeHours: input.fermoFrigoHours || 0,
      prefermentedFlourPct,
    });

    ldb = Math.round(finalDoughYeastG * 100) / 100;
  }

  // Calcola il totale come somma effettiva degli ingredienti arrotondati
  // Include anche la massa del poolish (PRE) nel totale
  const totaleEffettivo = farina + LM + acqua + sale + olio + malto + ldb + PDR + PRE + poolishLievito;

  return {
    totaleImpasto: Math.round(totaleEffettivo),
    farina,
    acqua,
    farinaTotale: Math.round(farinaTotale),
    acquaTotale: Math.round(acquaTotale),
    sale,
    olio,
    malto,
    lievito: input.yeastType === "LDB" ? ldb : LM,
    yeastType: input.yeastType,
    lmFarina: Math.round(farina_LM * 10) / 10,
    lmAcqua: Math.round(acqua_LM * 10) / 10,
    pastaDiRiporto: PDR,
    wConsigliato,
    poolishFarina,
    poolishAcqua,
    poolishLievito,
  };
}

// ============================================================
// TEMPERATURA ACQUA
// ============================================================

export function calculateWaterTemp(
  tAmbiente: number,
  tDesiderata: number,
  mixingMethod: MixingMethod,
  tFarina?: number,
): number {
  const heat = MIXING_HEAT[mixingMethod];
  const flourTemp = tFarina ?? tAmbiente;
  return Math.round(3 * tDesiderata - tAmbiente - flourTemp - heat);
}

// ============================================================
// PROCESSO (step-by-step)
// ============================================================

import { getStepSequence, STEP_MINUTES, type StepDef } from "./process-config";

export interface ProcessStep {
  id: string;
  name: string;
  description: string;
  /** Durata in ore */
  durationHours: number;
  /** Offset dall'inizio del processo (ore) — calcolato in avanti */
  startOffset: number;
  icon: string;
}

/**
 * Genera la sequenza di step con durate e offset.
 * L'appretto è calcolato come residuo: Maturazione - somma di tutte le altre durate.
 *
 * Per LM: il rinfresco è posizionato a T_impasto - 4h
 * Per poolish: è posizionato a T_impasto - poolishMaturationHours
 * Se entrambi: ciascuno parte indipendentemente prima dell'impasto
 */
export function generateProcess(input: DoughInput, result: DoughResult): ProcessStep[] {
  const isManual = input.mixingMethod === "manuale";
  const stepDefs = getStepSequence(input.recipe, input.fermoFrigoHours || 0);
  const maturationMinutes = input.maturationHours * 60;
  const frigoMinutes = (input.fermoFrigoHours || 0) * 60;

  // Filter out impasto2 step for manual method
  const filteredDefs = isManual ? stepDefs.filter((d) => d.id !== "impasto2") : stepDefs;

  // Resolve each step's duration in minutes
  function resolveDuration(def: StepDef): number {
    if (def.durationMinutes === "frigo") return frigoMinutes;
    if (def.durationMinutes === "poolish") return input.poolishMaturationHours * 60;
    if (def.durationMinutes === "appretto") return 0; // placeholder, calculated below
    // Manual: impasto is 20min instead of 15
    if (def.id === "impasto" && isManual) return 20;
    return def.durationMinutes;
  }

  // Calculate sum of all non-appretto durations to find appretto as residual
  let fixedMinutes = 0;
  for (const def of filteredDefs) {
    if (def.durationMinutes !== "appretto") {
      fixedMinutes += resolveDuration(def);
    }
  }

  const apprettoMinutes = Math.max(0, maturationMinutes - fixedMinutes);

  // Build steps with durations
  const coreSteps: ProcessStep[] = [];
  let offset = 0;
  for (const def of filteredDefs) {
    let durMin: number;
    if (def.durationMinutes === "appretto") {
      durMin = apprettoMinutes;
    } else {
      durMin = resolveDuration(def);
    }
    // Skip frigo step if duration is 0
    if (def.id === "frigo" && durMin === 0) continue;

    const durHours = durMin / 60;
    const descr = enrichDescription(def, input, result, durMin, isManual);
    coreSteps.push({
      id: def.id,
      name: def.name,
      description: descr,
      durationHours: durHours,
      startOffset: offset,
      icon: def.icon,
    });
    offset += durHours;
  }

  // Find the "impasto" step offset to anchor pre-steps
  const impastoStep = coreSteps.find((s) => s.id === "impasto");
  const impastoOffset = impastoStep ? impastoStep.startOffset : 0;

  // Build pre-impasto steps (LM rinfresco, poolish)
  const preSteps: ProcessStep[] = [];

  const hasLM = input.yeastType === "LM";
  const hasPoolish = input.poolishPercent > 0;
  const hasAutolisi = input.autolisiHours > 0;

  if (hasAutolisi) {
    const autoDurHours = input.autolisiHours;
    preSteps.push({
      id: "autolisi",
      name: "Autolisi",
      description: `Mescolare farina e acqua (senza lievito e sale). Lasciar riposare per ${autoDurHours}h.`,
      durationHours: autoDurHours,
      startOffset: impastoOffset - autoDurHours,
      icon: "💧",
    });
  }

  if (hasLM) {
    const lmDurHours = STEP_MINUTES.rinfrescoLM / 60;
    preSteps.push({
      id: "rinfresco_lm",
      name: "Rinfresco Lievito Madre",
      description: `Rinfrescare il lievito madre (${result.lievito}g). Lasciare maturare a ${input.tAmbiente}°C per ${lmDurHours}h.`,
      durationHours: lmDurHours,
      startOffset: impastoOffset - lmDurHours,
      icon: "🌱",
    });
  }

  if (hasPoolish) {
    const poolishDurHours = input.poolishMaturationHours;
    const isBiga = (input.prefermentoType ?? "poolish") === "biga";
    preSteps.push({
      id: isBiga ? "biga" : "poolish",
      name: isBiga ? "Preparazione Biga" : "Preparazione Poolish",
      description: `Mescolare ${result.poolishFarina}g farina, ${result.poolishAcqua}g acqua, ${result.poolishLievito}g lievito. Lasciar maturare ${poolishDurHours}h${isBiga ? ` a ~${input.tAmbiente}°C` : ""}.`,
      durationHours: poolishDurHours,
      startOffset: impastoOffset - poolishDurHours,
      icon: isBiga ? "🍞" : "🫧",
    });
  }

  // Merge: pre-steps may start before offset 0, so we need to shift everything
  const allSteps = [...preSteps, ...coreSteps];
  const minOffset = Math.min(0, ...allSteps.map((s) => s.startOffset));

  // Normalize so everything starts at 0
  if (minOffset < 0) {
    const shift = -minOffset;
    for (const s of allSteps) {
      s.startOffset += shift;
    }
  }

  // Sort by startOffset
  allSteps.sort((a, b) => a.startOffset - b.startOffset);

  return allSteps;
}

/** Arricchisce le descrizioni con dati contestuali */
function enrichDescription(
  def: StepDef,
  input: DoughInput,
  result: DoughResult,
  durMin: number,
  isManual: boolean,
): string {
  const durH = durMin / 60;
  switch (def.id) {
    case "impasto": {
      const acquaLabel = isManual ? `${result.acqua}g acqua` : `${Math.round(result.acqua * 0.8)}g acqua (80%)`;
      return `Unire ${result.farina}g farina, ${acquaLabel}, ${result.lievito}g ${result.yeastType === "LDB" ? "lievito di birra" : "lievito madre"}, ${result.sale}g sale${result.olio > 0 ? `, ${result.olio}g olio` : ""}${result.malto > 0 ? `, ${result.malto}g malto` : ""}. Impastare ${isManual ? "a mano per 20 minuti" : "in 1ª velocità"}.`;
    }
    case "impasto2":
      return `Aggiungere i restanti ${Math.round(result.acqua * 0.2)}g acqua (20%). Impastare in 2ª velocità fino a incordatura.`;
    case "frigo":
      return `Coprire e mettere in frigorifero a 4°C per ${durH.toFixed(1)}h.`;
    case "appretto":
      return `Lasciar lievitare i panetti a temperatura ambiente (${input.tAmbiente}°C) per ${formatDurShort(durMin)}.`;
    case "puntata":
      return `Lievitazione in massa a temperatura ambiente (${input.tAmbiente}°C). Coprire con pellicola.`;
    case "staglio":
      return `Dividere in ${input.numPanetti} panetti da ${input.pesoPanetto}g. Formare sfere lisce.`;
    default:
      return def.description;
  }
}

function formatDurShort(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function getProcessDuration(input: DoughInput, result: DoughResult): number {
  const steps = generateProcess(input, result);
  if (steps.length === 0) return 0;
  const last = steps[steps.length - 1];
  return last.startOffset + last.durationHours;
}
