import { supabase } from "./supabase";
import type { RecipeType, YeastType, PrefermentoType, MixingMethod } from "./dough-calculator";
import type { Teglia, MaturationMode } from "@/pages/Index";
import type { FlourItem } from "@/components/DoughCalculator";

/**
 * SavedRecipe maps 1:1 to the pizza_recipes table columns.
 * Only columns that actually exist in the DB are listed here.
 */
export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_name: string;
  recipe_type: string;
  quantity?: number;
  dough_ball_weight?: number;
  leavening_hours?: number;
  ambient_temperature?: number;
  yeast_type: string;
  maturation_hours: number;
  cold_retard_hours?: number;
  autolysis_hours: number;
  preferment_type?: string;
  poolish_flour_percentage?: number;
  start_datetime?: string | null;
  eat_datetime?: string | null;
  hydration_percentage?: number;
  salt_percentage?: number;
  oil_percentage?: number;
  malt_percentage?: number;
  old_dough_grams?: number;
  flour_mode: string;
  total_dough_weight?: number;
  total_flour_grams?: number;
  total_water_grams?: number;
  total_yeast_grams?: number;
  total_salt_grams?: number;
  mixing_method: string;
  recommended_water_temperature_c?: number;
  is_hidden?: boolean;
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

/**
 * Maps UI state to pizza_recipes DB columns.
 * ONLY columns that exist in the table are included.
 */
function stateToRow(name: string, state: RecipeFormState, userId: string) {
  return {
    user_id: userId,
    recipe_name: name,
    recipe_type: state.recipe,
    quantity: state.numPanetti,
    dough_ball_weight: state.pesoPanetto,
    yeast_type: state.yeastType === "LDB" ? "lievito_di_birra"
      : state.lmIdratazione === 50 ? "lm_solido" : "licoli",
    maturation_hours: state.maturationHours,
    cold_retard_hours: state.fermoFrigoHours,
    autolysis_hours: state.autolisiHours,
    preferment_type: state.prefermentoType,
    poolish_flour_percentage: state.poolishPercent,
    hydration_percentage: state.idratazione,
    salt_percentage: state.salePercent,
    oil_percentage: state.olioPercent,
    malt_percentage: state.maltoPercent,
    old_dough_grams: state.pastaDiRiporto,
    flour_mode: state.flourMode === "mix" ? "mix_di_farine" : "monofarina",
    mixing_method: state.mixingMethod,
    ambient_temperature: state.tAmbiente,
    start_datetime: state.scheduleDate?.toISOString() || null,
  };
}

/**
 * Maps a DB row back to the UI form state.
 * Fields not stored in the DB get sensible defaults.
 */
export function rowToState(row: SavedRecipe): RecipeFormState {
  return {
    recipe: row.recipe_type as RecipeType,
    numPanetti: row.quantity ?? 4,
    pesoPanetto: row.dough_ball_weight ?? 250,
    idratazione: row.hydration_percentage ?? 66,
    yeastType: (row.yeast_type === "lievito_di_birra" ? "LDB" : "LM") as YeastType,
    lmIdratazione: row.yeast_type === "licoli" ? 100 : 50,
    maturationHours: row.maturation_hours ?? 6,
    salePercent: row.salt_percentage ?? 3,
    olioPercent: row.oil_percentage ?? 0,
    maltoPercent: row.malt_percentage ?? 0,
    teglie: [{ id: 1, shape: "rettangolare", width: 35, height: 42, diameter: 30 }],
    poolishPercent: row.poolish_flour_percentage ?? 0,
    poolishMaturationHours: 12,
    prefermentoType: (row.preferment_type || "poolish") as PrefermentoType,
    tempPrefermento: 22,
    pastaDiRiporto: row.old_dough_grams ?? 0,
    pastaDiRiportoIdratazione: 50,
    fermoFrigoHours: row.cold_retard_hours ?? 0,
    autolisiHours: row.autolysis_hours ?? 0,
    tAmbiente: row.ambient_temperature ?? 22,
    flourMode: (row.flour_mode === "mix_di_farine" ? "mix" : "mono") as "mono" | "mix",
    flours: [
      { id: 1, name: "Farina 1", w: 300, percent: 50 },
      { id: 2, name: "Farina 2", w: 200, percent: 50 },
    ],
    lmPercent: 30,
    lmCustomActive: false,
    breadCustom: false,
    breadCustomWeight: 1000,
    mixingMethod: (row.mixing_method || "manuale") as MixingMethod,
    maturationMode: "quando_mangio" as MaturationMode,
    scheduleDate: row.start_datetime ? new Date(row.start_datetime) : undefined,
    scheduleHour: row.start_datetime ? new Date(row.start_datetime).getHours() : 20,
    scheduleMinute: row.start_datetime ? new Date(row.start_datetime).getMinutes() : 0,
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
