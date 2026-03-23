/**
 * ============================================================
 * ⚙️ CONFIGURAZIONE STEP DEL PROCESSO
 * ============================================================
 *
 * File dedicato e facilmente editabile per modificare:
 * - Durate fisse degli step (in minuti)
 * - Sequenze degli step per tipo di ricetta
 * - Icone e descrizioni
 *
 * NOTA: Tutte le durate sono in MINUTI per leggibilità.
 * La conversione in ore avviene nel motore di processo.
 */

import type { RecipeType } from "./dough-calculator";

// ============================================================
// ⚙️ DURATE FISSE DEGLI STEP (minuti)
// ============================================================

export const STEP_MINUTES = {
  /** Rinfresco lievito madre */
  rinfrescoLM: 4 * 60,          // 240 min = 4h

  /** Impasto 1a velocità */
  impasto: 15,

  /** Impasto 2a velocità */
  impasto2aVelocita: 5,

  /** Pausa + giro di pieghe (per ciascun giro) */
  pausaPieghe: 20,

  /** Puntata (impasto diretto, senza frigo) */
  puntataDiretta: 60,

  /** Staglio */
  staglio: 10,

  /** Stesura e cottura (napoletana/pane) */
  stesuraCottura: 2,

  /** Stesura in teglia (teglia romana / focaccia) */
  stesuraInTeglia: 5,

  /** Lievitazione in teglia (teglia romana / focaccia) */
  lievitazioneInTeglia: 60,

  /** Cottura teglia/focaccia */
  cotturaTeglia: 15,

  // Step con durata zero (marker)
  start: 0,
  buonAppetito: 0,
} as const;

// ============================================================
// ⚙️ DEFINIZIONE STEP
// ============================================================

export interface StepDef {
  /** Identificativo univoco dello step */
  id: string;
  /** Nome visualizzato */
  name: string;
  /** Icona emoji */
  icon: string;
  /**
   * Durata in minuti:
   * - numero fisso
   * - "frigo" → usa fermoFrigoHours dall'input
   * - "appretto" → calcolato come residuo della maturazione
   * - "poolish" → usa poolishMaturationHours dall'input
   */
  durationMinutes: number | "frigo" | "appretto" | "poolish";
  /** Descrizione template (può contenere placeholder) */
  description: string;
}

// ============================================================
// ⚙️ SEQUENZE STEP PER RICETTA
// ============================================================

/**
 * Napoletana / Napoletana Contemporanea / Pane — CON fermo frigo
 */
const STEPS_NAPOLETANA_FRIGO: StepDef[] = [
  { id: "start", name: "Inizio", icon: "🟢", durationMinutes: STEP_MINUTES.start, description: "Si parte!" },
  { id: "impasto", name: "Impasto", icon: "🤲", durationMinutes: STEP_MINUTES.impasto, description: "Impastare tutti gli ingredienti in 1ª velocità." },
  { id: "impasto2", name: "Impasto 2ª velocità", icon: "🔄", durationMinutes: STEP_MINUTES.impasto2aVelocita, description: "Impastare in 2ª velocità fino a incordatura." },
  { id: "pieghe1", name: "Pausa + 1° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 1° giro di pieghe (stretch & fold)." },
  { id: "pieghe2", name: "Pausa + 2° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 2° giro di pieghe." },
  { id: "pieghe3", name: "Pausa + 3° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 3° giro di pieghe." },
  { id: "frigo", name: "Puntata in frigo", icon: "❄️", durationMinutes: "frigo", description: "Coprire e mettere in frigorifero a 4°C." },
  { id: "staglio", name: "Staglio", icon: "⚖️", durationMinutes: STEP_MINUTES.staglio, description: "Dividere l'impasto e formare i panetti." },
  { id: "appretto", name: "Appretto", icon: "🫗", durationMinutes: "appretto", description: "Lasciar lievitare i panetti a temperatura ambiente." },
  { id: "cottura", name: "Stesura e cottura", icon: "🍕", durationMinutes: STEP_MINUTES.stesuraCottura, description: "Stendere e cuocere." },
  { id: "fine", name: "Buon appetito!", icon: "🎉", durationMinutes: STEP_MINUTES.buonAppetito, description: "È pronto! Buon appetito!" },
];

/**
 * Napoletana / Napoletana Contemporanea / Pane — SENZA fermo frigo (impasto diretto)
 */
const STEPS_NAPOLETANA_DIRETTO: StepDef[] = [
  { id: "start", name: "Inizio", icon: "🟢", durationMinutes: STEP_MINUTES.start, description: "Si parte!" },
  { id: "impasto", name: "Impasto", icon: "🤲", durationMinutes: STEP_MINUTES.impasto, description: "Impastare tutti gli ingredienti in 1ª velocità." },
  { id: "impasto2", name: "Impasto 2ª velocità", icon: "🔄", durationMinutes: STEP_MINUTES.impasto2aVelocita, description: "Impastare in 2ª velocità fino a incordatura." },
  { id: "pieghe1", name: "Pausa + 1° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 1° giro di pieghe (stretch & fold)." },
  { id: "pieghe2", name: "Pausa + 2° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 2° giro di pieghe." },
  { id: "pieghe3", name: "Pausa + 3° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 3° giro di pieghe." },
  { id: "puntata", name: "Puntata", icon: "⏳", durationMinutes: STEP_MINUTES.puntataDiretta, description: "Lievitazione in massa a temperatura ambiente. Coprire con pellicola." },
  { id: "staglio", name: "Staglio", icon: "⚖️", durationMinutes: STEP_MINUTES.staglio, description: "Dividere l'impasto e formare i panetti." },
  { id: "appretto", name: "Appretto", icon: "🫗", durationMinutes: "appretto", description: "Lasciar lievitare i panetti a temperatura ambiente." },
  { id: "cottura", name: "Stesura e cottura", icon: "🍕", durationMinutes: STEP_MINUTES.stesuraCottura, description: "Stendere e cuocere." },
  { id: "fine", name: "Buon appetito!", icon: "🎉", durationMinutes: STEP_MINUTES.buonAppetito, description: "È pronto! Buon appetito!" },
];

/**
 * Pizza in teglia alla romana / Focaccia — CON o SENZA frigo
 * (se fermoFrigo = 0, lo step frigo avrà durata 0 e viene saltato automaticamente)
 */
const STEPS_TEGLIA_FRIGO: StepDef[] = [
  { id: "start", name: "Inizio", icon: "🟢", durationMinutes: STEP_MINUTES.start, description: "Si parte!" },
  { id: "impasto", name: "Impasto", icon: "🤲", durationMinutes: STEP_MINUTES.impasto, description: "Impastare tutti gli ingredienti in 1ª velocità." },
  { id: "impasto2", name: "Impasto 2ª velocità", icon: "🔄", durationMinutes: STEP_MINUTES.impasto2aVelocita, description: "Impastare in 2ª velocità fino a incordatura." },
  { id: "pieghe1", name: "Pausa + 1° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 1° giro di pieghe (stretch & fold)." },
  { id: "pieghe2", name: "Pausa + 2° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 2° giro di pieghe." },
  { id: "pieghe3", name: "Pausa + 3° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 3° giro di pieghe." },
  { id: "frigo", name: "Puntata in frigo", icon: "❄️", durationMinutes: "frigo", description: "Coprire e mettere in frigorifero a 4°C." },
  { id: "staglio", name: "Staglio", icon: "⚖️", durationMinutes: STEP_MINUTES.staglio, description: "Dividere l'impasto nelle porzioni per ogni teglia." },
  { id: "appretto", name: "Appretto", icon: "🫗", durationMinutes: "appretto", description: "Lasciar lievitare l'impasto a temperatura ambiente." },
  { id: "stesura_teglia", name: "Stesura in teglia", icon: "🫓", durationMinutes: STEP_MINUTES.stesuraInTeglia, description: "Stendere l'impasto nella teglia oliata." },
  { id: "lievitazione_teglia", name: "Lievitazione in teglia", icon: "⏳", durationMinutes: STEP_MINUTES.lievitazioneInTeglia, description: "Lasciar lievitare in teglia a temperatura ambiente." },
  { id: "cottura_teglia", name: "Cottura", icon: "🔥", durationMinutes: STEP_MINUTES.cotturaTeglia, description: "Cuocere in forno preriscaldato." },
  { id: "fine", name: "Buon appetito!", icon: "🎉", durationMinutes: STEP_MINUTES.buonAppetito, description: "È pronto! Buon appetito!" },
];

const STEPS_TEGLIA_DIRETTO: StepDef[] = [
  { id: "start", name: "Inizio", icon: "🟢", durationMinutes: STEP_MINUTES.start, description: "Si parte!" },
  { id: "impasto", name: "Impasto", icon: "🤲", durationMinutes: STEP_MINUTES.impasto, description: "Impastare tutti gli ingredienti in 1ª velocità." },
  { id: "impasto2", name: "Impasto 2ª velocità", icon: "🔄", durationMinutes: STEP_MINUTES.impasto2aVelocita, description: "Impastare in 2ª velocità fino a incordatura." },
  { id: "pieghe1", name: "Pausa + 1° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 1° giro di pieghe (stretch & fold)." },
  { id: "pieghe2", name: "Pausa + 2° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 2° giro di pieghe." },
  { id: "pieghe3", name: "Pausa + 3° giro di pieghe", icon: "🔃", durationMinutes: STEP_MINUTES.pausaPieghe, description: "Riposare, poi eseguire il 3° giro di pieghe." },
  { id: "puntata", name: "Puntata", icon: "⏳", durationMinutes: STEP_MINUTES.puntataDiretta, description: "Lievitazione in massa a temperatura ambiente. Coprire con pellicola." },
  { id: "staglio", name: "Staglio", icon: "⚖️", durationMinutes: STEP_MINUTES.staglio, description: "Dividere l'impasto nelle porzioni per ogni teglia." },
  { id: "appretto", name: "Appretto", icon: "🫗", durationMinutes: "appretto", description: "Lasciar lievitare l'impasto a temperatura ambiente." },
  { id: "stesura_teglia", name: "Stesura in teglia", icon: "🫓", durationMinutes: STEP_MINUTES.stesuraInTeglia, description: "Stendere l'impasto nella teglia oliata." },
  { id: "lievitazione_teglia", name: "Lievitazione in teglia", icon: "⏳", durationMinutes: STEP_MINUTES.lievitazioneInTeglia, description: "Lasciar lievitare in teglia a temperatura ambiente." },
  { id: "cottura_teglia", name: "Cottura", icon: "🔥", durationMinutes: STEP_MINUTES.cotturaTeglia, description: "Cuocere in forno preriscaldato." },
  { id: "fine", name: "Buon appetito!", icon: "🎉", durationMinutes: STEP_MINUTES.buonAppetito, description: "È pronto! Buon appetito!" },
];

// ============================================================
// ⚙️ MAPPING RICETTA → SEQUENZA STEP
// ============================================================

/**
 * Ritorna la sequenza di step corretta in base alla ricetta e alla presenza di fermo frigo.
 */
export function getStepSequence(recipe: RecipeType, fermoFrigoHours: number): StepDef[] {
  const hasFrigo = fermoFrigoHours > 0;

  switch (recipe) {
    case "napoletana":
    case "napoletana_contemporanea":
    case "pane_classico":
      return hasFrigo ? STEPS_NAPOLETANA_FRIGO : STEPS_NAPOLETANA_DIRETTO;

    case "teglia_romana":
    case "focaccia_genovese":
      return hasFrigo ? STEPS_TEGLIA_FRIGO : STEPS_TEGLIA_DIRETTO;

    default:
      return hasFrigo ? STEPS_NAPOLETANA_FRIGO : STEPS_NAPOLETANA_DIRETTO;
  }
}
