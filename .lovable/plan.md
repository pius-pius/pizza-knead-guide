

# Ristrutturazione Completa dell'App Pizza Perfetta

## Panoramica
Riorganizzazione profonda dell'interfaccia e della logica dell'app: nuove ricette, navigazione semplificata, sezione farine integrata, teglia rotonda, calcolo temperature nell'area dosi, e correzione dei messaggi di maturazione.

---

## 1. Nuove Ricette e Preset

Sostituzione di "Custom" con tre nuove opzioni:
- **Focaccia Genovese** (sale 2.5%, olio 8%, LDB 0.47%)
- **Napoletana Contemporanea** (sale 3%, olio 0%, LDB 0.47%, idratazione default piu alta)
- **Carica Ricetta** (pulsante disabilitato/placeholder con label "Coming soon")

Ogni ricetta imposta automaticamente i valori di default (idratazione, sale, olio, malto, tipo lievito) quando selezionata.

File: `src/lib/dough-calculator.ts` - aggiungere i nuovi tipi e preset nel record RECIPES.

---

## 2. Navigazione - Ristrutturazione Tab

Le 5 icone in basso cambiano:
- **Ricetta** (ex "Dosi") - il calcolatore con tutti gli input
- **Dosi** (nuova) - risultati ingredienti + temperatura acqua consigliata + selezione metodo impasto
- **Farine** - rimossa dal menu in basso, integrata inline nella pagina Ricetta
- **Acqua** - rimossa (integrata in Dosi)
- **Processo** - resta
- **Timer** - resta

Tab finali: `Ricetta | Dosi | Processo | Timer` (4 tab)

File: `src/pages/Index.tsx` - aggiornare tab e rimuovere FlourMixer/WaterTemp dalle tab.

---

## 3. Pagina Ricetta (DoughCalculator) - Riordino Sezioni

Ordine delle sezioni dall'alto verso il basso:

### 3a. Selezione Ricetta
Griglia con: Napoletana, Teglia Romana, Pane Classico, Focaccia Genovese, Napoletana Contemporanea, Carica Ricetta (grayed out).

### 3b. Quantita (panetti/teglie/pane)
- **Teglia Romana**: aggiunta opzione teglia rotonda (diametro) oltre a rettangolare. Mostra "Peso totale impasto: XXXg" e "Consigliato per ~X persone" (calcolato come peso/180g circa).
- **Pane Classico**: bottoni 500g, 750g, 1000g + "Custom" (cliccabile, apre input grammi).
- **Altre ricette**: come ora (numero panetti + peso panetto).

### 3c. Idratazione
Slider range 50-100% (attualmente 50-90%).

### 3d. Tipo di Lievito
Spostato qui (prima era dopo maturazione). Due bottoni: LDB / LM.
Se LM selezionato: due bottoni "50% (LM solido)" / "100% (Licoli)" al posto dello slider.

### 3e. Farine (NUOVA sezione inline)
Due bottoni: "Monofarina" (default) / "Mix di farine".
- **Monofarina**: mostra indicazione "W consigliato: XXX per YYh di maturazione".
- **Mix di farine**: apre il componente FlourMixer inline (integrato nella pagina, non piu tab separata). Gli slider delle percentuali sono attivi e collegati: muovendo uno, gli altri si aggiustano. Mostra peso totale ottenuto vs peso target in evidenza.

### 3f. Maturazione
- Modalita manuale/datetime come ora.
- Sotto "Ore maturazione": slider **Temperatura ambiente** (5-40 C) con icona info (i) che spiega: "Permette di calcolare la quantita di lievito e i tempi di processo".
- Correzione messaggio "Quando mangio": le ore di maturazione sono le ore del **processo** (non la differenza semplice adesso-cottura). Il messaggio "Inizia l'impasto adesso" viene sostituito con l'orario corretto calcolato all'indietro dalla cottura meno la durata totale del processo.

### 3g. Pulsanti in basso
- **Opzioni avanzate** (apre sezione)
- **Salva ricetta** (salva tutti i parametri in localStorage come ricetta personalizzata, senza modificare i preset standard)
- **Vai alle Dosi** (grande, primario) - naviga alla tab Dosi

### 3h. Opzioni Avanzate (espandibili)
- Autolisi: default **0h** (non 2h), slider 0-4h. Nota: non influenza dosi, solo processo e messaggio ore.
- Sale %: slider con valore default dalla ricetta selezionata
- Olio %: slider con valore default dalla ricetta
- LM %: slider (visibile solo se LM selezionato)
- Poolish e Pasta di riporto come ora

---

## 4. Pagina Dosi (NUOVA)

Nuovo componente che mostra:
- Elenco ingredienti calcolati (farina, acqua, sale, lievito, olio, malto...). Se mix farine: mostra ogni farina con nome e peso.
- **Temperatura acqua consigliata**: calcolata usando T ambiente (gia inserita nella pagina Ricetta) e metodo impasto (selettore qui: Manuale, Forcella, Spirale, Braccia tuffanti). La T desiderata viene letta dall'Excel in funzione dell'idratazione.
- Poolish sub-risultati se attivo.

File: `src/components/DoughResults.tsx` (nuovo componente).

---

## 5. FlourMixer - Slider Percentuali Attivi

Aggiornamento del componente FlourMixer:
- Ogni farina ha uno slider % che controlla la percentuale sul totale.
- Con 2 farine: aumentando una, l'altra scende.
- Con 3+ farine: aumentando una, le altre scendono proporzionalmente.
- I grammi si aggiornano di conseguenza (% * peso totale target).
- Peso totale ottenuto vs peso target ben visibile (come il W ottenuto).

---

## 6. Stato Condiviso

Lo stato del calcolatore (recipe, idratazione, yeastType, maturationHours, temperatura ambiente, farine, ecc.) viene sollevato in `Index.tsx` e passato via props sia a Ricetta che a Dosi e Processo. Questo permette che cambiando i parametri in Ricetta, Dosi e Processo si aggiornino automaticamente.

---

## Dettagli Tecnici

### File da modificare:
1. **`src/lib/dough-calculator.ts`** - Aggiungere ricette focaccia_genovese, napoletana_contemporanea. Aggiungere funzione per calcolo persone consigliate. Aggiungere lookup T desiderata da idratazione.
2. **`src/components/DoughCalculator.tsx`** - Riordino completo sezioni, integrazione farine inline, aggiunta T ambiente, fix messaggio maturazione, pulsanti salva/avanti.
3. **`src/components/DoughResults.tsx`** (NUOVO) - Pagina risultati con ingredienti e temperatura acqua.
4. **`src/components/FlourMixer.tsx`** - Slider percentuali attivi e collegati, peso target vs ottenuto.
5. **`src/pages/Index.tsx`** - Stato sollevato, 4 tab (Ricetta/Dosi/Processo/Timer), rimozione tab Farine e Acqua.
6. **`src/components/WaterTemp.tsx`** - Rimosso come pagina standalone (logica riusata in DoughResults).

### File da creare:
- `src/components/DoughResults.tsx`

### File da rimuovere dalla navigazione:
- FlourMixer (integrato inline)
- WaterTemp (integrato in DoughResults)

