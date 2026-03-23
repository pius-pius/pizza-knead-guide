import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Lang = "it" | "en";

const translations = {
  // ── Header ──
  "app.title": { it: "Pizza Perfetta 🍕", en: "Perfect Pizza 🍕" },
  "app.subtitle": { it: "Calcolatore professionale per impasti", en: "Professional dough calculator" },

  // ── Tabs ──
  "tab.ricetta": { it: "Ricetta", en: "Recipe" },
  "tab.dosi": { it: "Dosi", en: "Doses" },
  "tab.processo": { it: "Processo", en: "Process" },

  // ── Recipe selector ──
  "recipe.title": { it: "CHE TIPO DI PIZZA VUOI CUCINARE ?", en: "WHAT TYPE OF PIZZA DO YOU WANT TO MAKE?" },
  "recipe.napoletana": { it: "Napoletana", en: "Neapolitan" },
  "recipe.teglia_romana": { it: "Pizza in Teglia", en: "Pan Pizza" },
  "recipe.pane_classico": { it: "Pane Classico", en: "Classic Bread" },
  "recipe.focaccia_genovese": { it: "Focaccia Genovese", en: "Genovese Focaccia" },
  "recipe.napoletana_contemporanea": { it: "Nap. Contemporanea", en: "Contemporary Neap." },
  "recipe.carica": { it: "Carica Ricetta", en: "Load Recipe" },
  "recipe.coming_soon": { it: "Coming soon", en: "Coming soon" },

  // ── Quantity ──
  "qty.teglia_title": { it: "SCEGLI IL NUMERO, LA TIPOLOGIA E LA DIMENSIONE DELLE TEGLIE", en: "CHOOSE THE NUMBER, TYPE AND SIZE OF PANS" },
  "qty.teglia": { it: "Teglia", en: "Pan" },
  "qty.rettangolare": { it: "Rettangolare", en: "Rectangular" },
  "qty.rotonda": { it: "Rotonda", en: "Round" },
  "qty.larghezza": { it: "Larghezza (cm)", en: "Width (cm)" },
  "qty.lunghezza": { it: "Lunghezza (cm)", en: "Length (cm)" },
  "qty.diametro": { it: "Diametro (cm)", en: "Diameter (cm)" },
  "qty.peso_totale": { it: "Peso totale impasto", en: "Total dough weight" },
  "qty.consigliato_persone": { it: "Consigliato per ~{n} persone", en: "Recommended for ~{n} people" },
  "qty.aggiungi_teglia": { it: "Aggiungi teglia", en: "Add pan" },
  "qty.peso_pane": { it: "Peso pane", en: "Bread weight" },
  "qty.quantita": { it: "Quantità", en: "Quantity" },
  "qty.quanti_panetti": { it: "QUANTI PANETTI/PIZZE ?", en: "HOW MANY DOUGH BALLS/PIZZAS?" },
  "qty.peso_panetto": { it: "Peso panetto", en: "Ball weight" },

  // ── Schedule ──
  "sched.dimmi_quando": { it: "🍽️ Dimmi quando vuoi mangiare", en: "🍽️ Tell me when you want to eat" },
  "sched.inizia_prep": { it: "Inizia preparazione", en: "Start preparation" },
  "sched.durata": { it: "Durata", en: "Duration" },
  "sched.mangio": { it: "Mangio", en: "Eating" },
  "sched.tocca_modificare": { it: "Tocca per modificare l'orario ☝️", en: "Tap to change the time ☝️" },
  "sched.incompatibile": { it: "⚠️ Durata del processo non compatibile con la data/ora di consumazione selezionata: diminuire ore di maturazione o posticipare l'orario.", en: "⚠️ Process duration incompatible with selected eating time: reduce maturation hours or postpone." },

  // ── Maturation ──
  "mat.ore": { it: "ORE DI LIEVITAZIONE/MATURAZIONE", en: "RISING/MATURATION HOURS" },
  "mat.info": { it: "Maturazione = Lievitazione per impasti diretti a temperatura ambiente", en: "Maturation = Rising for direct doughs at room temperature" },
  "mat.avviso_12h": { it: "⚠️ Processo avanzato: limitare maturazione a 12h o impostare Fermo Frigo in Opzioni avanzate (utenti esperti).", en: "⚠️ Advanced process: limit maturation to 12h or set Cold Rest in Advanced options (expert users)." },
  "mat.temp_ambiente": { it: "Temperatura ambiente", en: "Room temperature" },
  "mat.temp_info": { it: "Indica la temperatura del locale in cui riposa l'impasto. Influenza la quantità di lievito necessaria e la temperatura dell'acqua da usare.", en: "Indicates the room temperature where the dough rests. Affects yeast amount and water temperature." },

  // ── Buttons ──
  "btn.opzioni_avanzate": { it: "Opzioni avanzate", en: "Advanced options" },
  "btn.vai_dosi": { it: "Vai alle Dosi", en: "Go to Doses" },
  "btn.torna_ricetta": { it: "Torna alla ricetta", en: "Back to recipe" },
  "btn.conferma": { it: "Conferma", en: "Confirm" },

  // ── Advanced Options ──
  "adv.title": { it: "Opzioni Avanzate", en: "Advanced Options" },
  "adv.tipo_lievito": { it: "Tipo lievito", en: "Yeast type" },
  "adv.ldb": { it: "Lievito di Birra", en: "Baker's Yeast" },
  "adv.lm_solido": { it: "LM Solido", en: "Solid Starter" },
  "adv.licoli": { it: "Licoli", en: "Liquid Starter" },
  "adv.lm_custom": { it: "Lievito madre % custom", en: "Sourdough % custom" },
  "adv.attivo": { it: "attivo", en: "active" },
  "adv.non_attivo": { it: "non attivo", en: "inactive" },
  "adv.sovrascrive": { it: "⚠️ Sovrascrive il calcolo automatico", en: "⚠️ Overrides automatic calculation" },
  "adv.ore_maturazione": { it: "Ore di maturazione", en: "Maturation hours" },
  "adv.mat_12h": { it: "⚠️ Maturazione >12h: consigliato Fermo Frigo.", en: "⚠️ Maturation >12h: Cold Rest recommended." },
  "adv.fermo_frigo": { it: "Fermo frigo (ore)", en: "Cold rest (hours)" },
  "adv.liev_effettiva": { it: "Lievitazione effettiva", en: "Effective rising" },
  "adv.mat_meno_frigo": { it: "(maturazione − frigo)", en: "(maturation − cold rest)" },
  "adv.in_frigo": { it: "❄️ In frigo dalle", en: "❄️ In fridge from" },
  "adv.alle": { it: "alle", en: "to" },
  "adv.autolisi": { it: "Autolisi", en: "Autolyse" },
  "adv.autolisi_note": { it: "Non influenza le dosi, solo il processo", en: "Does not affect doses, only the process" },
  "adv.prefermento": { it: "Prefermento", en: "Pre-ferment" },
  "adv.farina_in": { it: "% farina in", en: "% flour in" },
  "adv.ore_mat": { it: "Ore maturazione", en: "Maturation hours" },
  "adv.range": { it: "Range", en: "Range" },
  "adv.idratazione_biga": { it: "Idratazione biga: 45%", en: "Biga hydration: 45%" },
  "adv.idratazione_poolish": { it: "Idratazione poolish: 100%", en: "Poolish hydration: 100%" },
  "adv.temp_prefermento": { it: "🌡️ Temperatura", en: "🌡️ Temperature" },
  "adv.temp_pref_note": { it: "Usata per il calcolo del lievito nel prefermento", en: "Used for yeast calculation in pre-ferment" },
  "adv.quando_mangiare": { it: "🍽️ Quando vuoi mangiare — clicca per modificare", en: "🍽️ When do you want to eat — click to change" },
  "adv.tocca_modificare": { it: "Tocca per modificare ☝️", en: "Tap to change ☝️" },
  "adv.incompatibile": { it: "⚠️ Durata del processo non compatibile con la data/ora di consumazione selezionata.", en: "⚠️ Process duration incompatible with selected eating time." },
  "adv.idratazione": { it: "Idratazione", en: "Hydration" },
  "adv.sale": { it: "Sale %", en: "Salt %" },
  "adv.olio": { it: "Olio %", en: "Oil %" },
  "adv.malto": { it: "Malto %", en: "Malt %" },
  "adv.pasta_riporto": { it: "Pasta di riporto", en: "Old dough" },
  "adv.farine": { it: "Farine", en: "Flours" },
  "adv.monofarina": { it: "Monofarina", en: "Single flour" },
  "adv.mix_farine": { it: "Mix di farine", en: "Flour blend" },
  "adv.w_consigliato": { it: "W consigliato", en: "Recommended W" },
  "adv.per_mat": { it: "per {n}h di maturazione", en: "for {n}h maturation" },

  // ── Dough Results ──
  "dosi.title": { it: "Dosi", en: "Doses" },
  "dosi.impasto_totale": { it: "Impasto totale", en: "Total dough" },
  "dosi.farina_totale": { it: "Farina totale", en: "Total flour" },
  "dosi.acqua": { it: "Acqua", en: "Water" },
  "dosi.ldb": { it: "Lievito di birra", en: "Baker's yeast" },
  "dosi.lm": { it: "Lievito madre", en: "Sourdough starter" },
  "dosi.sale": { it: "Sale", en: "Salt" },
  "dosi.olio": { it: "Olio EVO", en: "Olive oil" },
  "dosi.malto": { it: "Malto", en: "Malt" },
  "dosi.pasta_riporto": { it: "Pasta di riporto", en: "Old dough" },
  "dosi.temp_acqua": { it: "Temperatura acqua consigliata", en: "Recommended water temperature" },
  "dosi.metodo_impasto": { it: "Metodo di impasto", en: "Mixing method" },
  "dosi.t_ambiente": { it: "T ambiente", en: "Room temp" },
  "dosi.t_impasto": { it: "T impasto desiderata", en: "Desired dough temp" },
  "dosi.temp_negativa": { it: "⚠️ Temperatura negativa! Usa acqua con ghiaccio.", en: "⚠️ Negative temperature! Use ice water." },
  "dosi.farina_poolish": { it: "Farina poolish", en: "Poolish flour" },
  "dosi.acqua_poolish": { it: "Acqua poolish", en: "Poolish water" },
  "dosi.lievito_poolish": { it: "Lievito poolish", en: "Poolish yeast" },
  "dosi.farina_biga": { it: "Farina biga", en: "Biga flour" },
  "dosi.acqua_biga": { it: "Acqua biga", en: "Biga water" },
  "dosi.lievito_biga": { it: "Lievito biga", en: "Biga yeast" },

  // ── Mixing methods ──
  "mix.manuale": { it: "Manuale", en: "By hand" },
  "mix.forcella": { it: "Forcella", en: "Fork mixer" },
  "mix.spirale": { it: "Spirale", en: "Spiral mixer" },
  "mix.braccia_tuffanti": { it: "Braccia tuffanti", en: "Diving arm" },

  // ── Process ──
  "proc.title": { it: "Processo", en: "Process" },
  "proc.tempo_totale": { it: "Tempo totale", en: "Total time" },
  "proc.inizio": { it: "Inizio", en: "Start" },
  "proc.fine": { it: "Fine", en: "End" },
  "proc.annulla": { it: "Annulla", en: "Undo" },

  // ── Process steps ──
  "step.start": { it: "Inizio", en: "Start" },
  "step.start_desc": { it: "Si parte!", en: "Let's go!" },
  "step.impasto": { it: "Impasto", en: "Mixing" },
  "step.impasto_desc": { it: "Impastare tutti gli ingredienti in 1ª velocità.", en: "Mix all ingredients at 1st speed." },
  "step.impasto2": { it: "Impasto 2ª velocità", en: "2nd speed mixing" },
  "step.impasto2_desc": { it: "Impastare in 2ª velocità fino a incordatura.", en: "Mix at 2nd speed until gluten development." },
  "step.pieghe1": { it: "Pausa + 1° giro di pieghe", en: "Rest + 1st fold" },
  "step.pieghe1_desc": { it: "Riposare, poi eseguire il 1° giro di pieghe (stretch & fold).", en: "Rest, then perform 1st stretch & fold." },
  "step.pieghe2": { it: "Pausa + 2° giro di pieghe", en: "Rest + 2nd fold" },
  "step.pieghe2_desc": { it: "Riposare, poi eseguire il 2° giro di pieghe.", en: "Rest, then perform 2nd fold." },
  "step.pieghe3": { it: "Pausa + 3° giro di pieghe", en: "Rest + 3rd fold" },
  "step.pieghe3_desc": { it: "Riposare, poi eseguire il 3° giro di pieghe.", en: "Rest, then perform 3rd fold." },
  "step.frigo": { it: "Puntata in frigo", en: "Cold bulk fermentation" },
  "step.frigo_desc": { it: "Coprire e mettere in frigorifero a 4°C.", en: "Cover and place in the fridge at 4°C." },
  "step.staglio": { it: "Staglio", en: "Dividing" },
  "step.staglio_desc_nap": { it: "Dividere l'impasto e formare i panetti.", en: "Divide the dough and shape the balls." },
  "step.staglio_desc_teglia": { it: "Dividere l'impasto nelle porzioni per ogni teglia.", en: "Divide the dough into portions for each pan." },
  "step.appretto": { it: "Appretto", en: "Final proofing" },
  "step.appretto_desc_nap": { it: "Lasciar lievitare i panetti a temperatura ambiente.", en: "Let the dough balls rise at room temperature." },
  "step.appretto_desc_teglia": { it: "Lasciar lievitare l'impasto a temperatura ambiente.", en: "Let the dough rise at room temperature." },
  "step.puntata": { it: "Puntata", en: "Bulk fermentation" },
  "step.puntata_desc": { it: "Lievitazione in massa a temperatura ambiente. Coprire con pellicola.", en: "Bulk rise at room temperature. Cover with plastic wrap." },
  "step.cottura": { it: "Stesura e cottura", en: "Shaping & baking" },
  "step.cottura_desc": { it: "Stendere e cuocere.", en: "Shape and bake." },
  "step.stesura_teglia": { it: "Stesura in teglia", en: "Pan shaping" },
  "step.stesura_teglia_desc": { it: "Stendere l'impasto nella teglia oliata.", en: "Spread the dough in the oiled pan." },
  "step.lievitazione_teglia": { it: "Lievitazione in teglia", en: "Pan proofing" },
  "step.lievitazione_teglia_desc": { it: "Lasciar lievitare in teglia a temperatura ambiente.", en: "Let it rise in the pan at room temperature." },
  "step.cottura_teglia": { it: "Cottura", en: "Baking" },
  "step.cottura_teglia_desc": { it: "Cuocere in forno preriscaldato.", en: "Bake in preheated oven." },
  "step.fine": { it: "Buon appetito!", en: "Enjoy your meal!" },
  "step.fine_desc": { it: "È pronto! Buon appetito!", en: "It's ready! Enjoy!" },

  // ── Timer ──
  "timer.title": { it: "Timer Lievitazione", en: "Rising Timer" },
  "timer.rapida": { it: "Rapida", en: "Quick" },
  "timer.classica": { it: "Classica", en: "Classic" },
  "timer.frigo_24": { it: "Frigo 24h", en: "Fridge 24h" },
  "timer.frigo_48": { it: "Frigo 48h", en: "Fridge 48h" },
  "timer.temp_ambiente": { it: "Temperatura ambiente", en: "Room temperature" },
  "timer.in_frigo": { it: "In frigorifero", en: "In the fridge" },

  // ── Schedule Drawer ──
  "drawer.quando_inizio": { it: "Quando vuoi iniziare?", en: "When do you want to start?" },
  "drawer.quando_mangio": { it: "Quando vuoi mangiare?", en: "When do you want to eat?" },
  "drawer.giorno_inizio": { it: "Giorno di inizio", en: "Start day" },
  "drawer.giorno_mangio": { it: "Giorno in cui mangio", en: "Day I eat" },
  "drawer.scegli_giorno": { it: "Scegli il giorno", en: "Choose the day" },
  "drawer.ora_inizio": { it: "Ora di inizio", en: "Start time" },
  "drawer.ora_cottura": { it: "Ora di cottura", en: "Baking time" },
  "drawer.durata_processo": { it: "Durata processo", en: "Process duration" },
  "drawer.pronto": { it: "Pronto", en: "Ready" },
  "drawer.inizia_prep": { it: "Inizia preparazione", en: "Start preparation" },

  // ── Flour Mixer ──
  "flour.title": { it: "Miscela Farine", en: "Flour Blend" },
  "flour.percentuale": { it: "Percentuale", en: "Percentage" },
  "flour.aggiungi": { it: "Aggiungi farina", en: "Add flour" },
  "flour.w_ottenuto": { it: "W ottenuto", en: "Achieved W" },
  "flour.target": { it: "Target", en: "Target" },
  "flour.peso_totale": { it: "Peso totale", en: "Total weight" },
  "flour.w_ideale": { it: "✅ W nel range ideale!", en: "✅ W in ideal range!" },
  "flour.w_basso": { it: "↓ W troppo basso", en: "↓ W too low" },
  "flour.w_alto": { it: "↑ W troppo alto", en: "↑ W too high" },

  // ── Save ──
  "save.salvata": { it: "salvata!", en: "saved!" },
  "save.ricetta": { it: "Ricetta", en: "Recipe" },
} as const;

export type TranslationKey = keyof typeof translations;

// ── Context ──

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("app-lang");
    return (saved === "en" || saved === "it") ? saved : "it";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("app-lang", l);
  }, []);

  const t = useCallback((key: TranslationKey, vars?: Record<string, string | number>): string => {
    const entry = translations[key];
    if (!entry) return key;
    let text: string = entry[lang] || entry.it;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Get date-fns locale */
export function getDateLocale(lang: Lang) {
  // We import it lazily to keep this in sync
  if (lang === "en") return undefined; // date-fns defaults to English
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("date-fns/locale").it;
}
