import { supabase } from "./supabase";
import type { RecipeType, YeastType, PrefermentoType, MixingMethod } from "./dough-calculator";
import type { Teglia, MaturationMode } from "@/pages/Index";
import type { FlourItem } from "@/components/DoughCalculator";

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_name: string;
  recipe_type: string;
  recipe: string;
  num_panetti: number;
  peso_panetto: number;
  idratazione: number;
  yeast_type: string;
  lm_idratazione: number;
  maturation_hours: number;
  sale_percent: number;
  olio_percent: number;
  malto_percent: number;
  teglie: Teglia[] | null;
  poolish_percent: number;
  poolish_maturation_hours: number;
  prefermento_type: string;
  temp_prefermento: number;
  pasta_di_riporto: number;
  pasta_di_riporto_idratazione: number;
  fermo_frigo_hours: number;
  autolysis_hours: number;
  t_ambiente: number;
  flour_mode: string;
  flours: FlourItem[] | null;
  lm_percent: number;
  lm_custom_active: boolean;
  bread_custom: boolean;
  bread_custom_weight: number;
  mixing_method: string;
  maturation_mode: string;
  schedule_date: string | null;
  schedule_hour: number;
  schedule_minute: number;
  data: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeFormState {
  recipe: RecipeType;
  numPanetti: number;
  pesoPanetto: number;
  idratazione: number;
  yeastType: YeastType;
  lmIdratazione: 50 | 100;
  maturationHours: number;
  salePercent: number;
  olioPercent: number;
  maltoPercent: number;
  teglie: Teglia[];
  poolishPercent: number;
  poolishMaturationHours: number;
  prefermentoType: PrefermentoType;
  tempPrefermento: number;
  pastaDiRiporto: number;
  pastaDiRiportoIdratazione: number;
  fermoFrigoHours: number;
  autolisiHours: number;
  tAmbiente: number;
  flourMode: "mono" | "mix";
  flours: FlourItem[];
  lmPercent: number;
  lmCustomActive: boolean;
  breadCustom: boolean;
  breadCustomWeight: number;
  mixingMethod: MixingMethod;
  maturationMode: MaturationMode;
  scheduleDate?: Date;
  scheduleHour: number;
  scheduleMinute: number;
}

function stateToRow(name: string, state: RecipeFormState, userId: string) {
  return {
    user_id: userId,
    recipe_name: name,
    recipe_type: state.recipe,
    yeast_type: state.yeastType,
    maturation_hours: state.maturationHours,
    mixing_method: state.mixingMethod,
    flour_mode: state.flourMode,
    autolysis_hours: state.autolisiHours,
    payload: {
      numPanetti: state.numPanetti,
      pesoPanetto: state.pesoPanetto,
      idratazione: state.idratazione,
      lmIdratazione: state.lmIdratazione,
      salePercent: state.salePercent,
      olioPercent: state.olioPercent,
      maltoPercent: state.maltoPercent,
      teglie: state.teglie,
      poolishPercent: state.poolishPercent,
      poolishMaturationHours: state.poolishMaturationHours,
      prefermentoType: state.prefermentoType,
      tempPrefermento: state.tempPrefermento,
      pastaDiRiporto: state.pastaDiRiporto,
      pastaDiRiportoIdratazione: state.pastaDiRiportoIdratazione,
      fermoFrigoHours: state.fermoFrigoHours,
      tAmbiente: state.tAmbiente,
      flours: state.flours,
      lmPercent: state.lmPercent,
      lmCustomActive: state.lmCustomActive,
      breadCustom: state.breadCustom,
      breadCustomWeight: state.breadCustomWeight,
      maturationMode: state.maturationMode,
      scheduleDate: state.scheduleDate?.toISOString() || null,
      scheduleHour: state.scheduleHour,
      scheduleMinute: state.scheduleMinute,
    },
    updated_at: new Date().toISOString(),
  };
}

export function rowToState(row: SavedRecipe): RecipeFormState {
  const p = (row.payload as Record<string, unknown>) || {};
  return {
    recipe: (row.recipe_type) as RecipeType,
    numPanetti: (p.numPanetti as number) ?? row.num_panetti ?? 4,
    pesoPanetto: (p.pesoPanetto as number) ?? row.peso_panetto ?? 250,
    idratazione: (p.idratazione as number) ?? row.idratazione ?? 66,
    yeastType: (row.yeast_type || "LDB") as YeastType,
    lmIdratazione: ((p.lmIdratazione as number) === 100 ? 100 : 50) as 50 | 100,
    maturationHours: row.maturation_hours ?? 6,
    salePercent: (p.salePercent as number) ?? row.sale_percent ?? 3,
    olioPercent: (p.olioPercent as number) ?? row.olio_percent ?? 0,
    maltoPercent: (p.maltoPercent as number) ?? row.malto_percent ?? 0,
    teglie: (p.teglie as Teglia[]) || (row.teglie as Teglia[]) || [{ id: 1, shape: "rettangolare", width: 35, height: 42, diameter: 30 }],
    poolishPercent: (p.poolishPercent as number) ?? row.poolish_percent ?? 0,
    poolishMaturationHours: (p.poolishMaturationHours as number) ?? row.poolish_maturation_hours ?? 12,
    prefermentoType: ((p.prefermentoType as string) || row.prefermento_type || "poolish") as PrefermentoType,
    tempPrefermento: (p.tempPrefermento as number) ?? row.temp_prefermento ?? 22,
    pastaDiRiporto: (p.pastaDiRiporto as number) ?? row.pasta_di_riporto ?? 0,
    pastaDiRiportoIdratazione: (p.pastaDiRiportoIdratazione as number) ?? row.pasta_di_riporto_idratazione ?? 50,
    fermoFrigoHours: (p.fermoFrigoHours as number) ?? row.fermo_frigo_hours ?? 0,
    autolisiHours: row.autolysis_hours ?? 0,
    tAmbiente: (p.tAmbiente as number) ?? row.t_ambiente ?? 22,
    flourMode: ((p.flourMode as string) || row.flour_mode || "mono") as "mono" | "mix",
    flours: (p.flours as FlourItem[]) || (row.flours as FlourItem[]) || [
      { id: 1, name: "Farina 1", w: 300, percent: 50 },
      { id: 2, name: "Farina 2", w: 200, percent: 50 },
    ],
    lmPercent: (p.lmPercent as number) ?? row.lm_percent ?? 30,
    lmCustomActive: (p.lmCustomActive as boolean) ?? row.lm_custom_active ?? false,
    breadCustom: (p.breadCustom as boolean) ?? row.bread_custom ?? false,
    breadCustomWeight: (p.breadCustomWeight as number) ?? row.bread_custom_weight ?? 1000,
    mixingMethod: (row.mixing_method || "manuale") as MixingMethod,
    maturationMode: ((p.maturationMode as string) || row.maturation_mode || "quando_mangio") as MaturationMode,
    scheduleDate: (p.scheduleDate as string) ? new Date(p.scheduleDate as string) : row.schedule_date ? new Date(row.schedule_date) : undefined,
    scheduleHour: (p.scheduleHour as number) ?? row.schedule_hour ?? 20,
    scheduleMinute: (p.scheduleMinute as number) ?? row.schedule_minute ?? 0,
  };
}

export async function saveRecipeToDb(name: string, state: RecipeFormState, userId: string) {
  const row = stateToRow(name, state, userId);
  const { data, error } = await supabase
    .from("pizza_recipes")
    .insert(row)
    .select()
    .single();
  return { data, error };
}

export async function updateRecipeInDb(id: string, name: string, state: RecipeFormState, userId: string) {
  const row = stateToRow(name, state, userId);
  const { data, error } = await supabase
    .from("pizza_recipes")
    .update(row)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  return { data, error };
}

export async function fetchUserRecipes(userId: string) {
  const { data, error } = await supabase
    .from("pizza_recipes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return { data: data as SavedRecipe[] | null, error };
}

export async function fetchRecipeById(id: string) {
  const { data, error } = await supabase
    .from("pizza_recipes")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as SavedRecipe | null, error };
}

export async function deleteRecipeFromDb(id: string, userId: string) {
  const { error } = await supabase
    .from("pizza_recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  return { error };
}

export async function duplicateRecipe(id: string, userId: string, newName: string) {
  const { data: original, error: fetchError } = await fetchRecipeById(id);
  if (fetchError || !original) return { data: null, error: fetchError };

  const state = rowToState(original);
  return saveRecipeToDb(newName, state, userId);
}
