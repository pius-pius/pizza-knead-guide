import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { fetchUserRecipes, deleteRecipeFromDb, duplicateRecipe, type SavedRecipe } from "@/lib/recipes-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Trash2, Copy, ExternalLink, ArrowUpDown, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MyRecipes = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "created">("updated");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadRecipes();
  }, [user]);

  const loadRecipes = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await fetchUserRecipes(user.id);
    setLoading(false);
    if (error) setError(error.message);
    else setRecipes(data || []);
  };

  const filtered = useMemo(() => {
    let result = recipes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => r.recipe_name?.toLowerCase().includes(q) || r.recipe_type?.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const dateA = sortBy === "updated" ? a.updated_at : a.created_at;
      const dateB = sortBy === "updated" ? b.updated_at : b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    return result;
  }, [recipes, search, sortBy]);

  const handleDelete = async (id: string) => {
    if (!user || !confirm(t("myrecipes.confirm_delete"))) return;
    setDeletingId(id);
    const { error } = await deleteRecipeFromDb(id, user.id);
    setDeletingId(null);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { setRecipes(prev => prev.filter(r => r.id !== id)); toast({ title: t("myrecipes.deleted") }); }
  };

  const handleDuplicate = async (r: SavedRecipe) => {
    if (!user) return;
    setDuplicatingId(r.id);
    const newName = `${r.recipe_name} (${t("myrecipes.copy")})`;
    const { error } = await duplicateRecipe(r.id, user.id, newName);
    setDuplicatingId(null);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { await loadRecipes(); toast({ title: t("myrecipes.duplicated") }); }
  };

  const handleLoad = (id: string) => {
    navigate(`/?load=${id}`);
  };

  const recipeLabel = (type: string) => {
    const map: Record<string, string> = {
      napoletana: t("recipe.napoletana"),
      teglia_romana: t("recipe.teglia_romana"),
      pane_classico: t("recipe.pane_classico"),
      focaccia_genovese: t("recipe.focaccia_genovese"),
      napoletana_contemporanea: t("recipe.napoletana_contemporanea"),
    };
    return map[type] || type;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("auth.back_home")}
      </button>
      <h1 className="text-2xl font-bold text-center mb-4">{t("auth.my_recipes")}</h1>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("myrecipes.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="icon" onClick={() => setSortBy(s => s === "updated" ? "created" : "updated")} title={sortBy === "updated" ? t("myrecipes.sort_updated") : t("myrecipes.sort_created")}>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : error ? (
        <div className="bg-destructive/10 rounded-2xl p-6 text-center"><p className="text-destructive">{error}</p></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
          <p className="text-muted-foreground">{search ? t("myrecipes.no_results") : t("myrecipes.empty")}</p>
          {!search && <Button onClick={() => navigate("/")} className="mt-4 rounded-xl">{t("myrecipes.create_first")}</Button>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-card rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{r.recipe_name}</h3>
                  <p className="text-xs text-muted-foreground">{recipeLabel(r.recipe_type || r.recipe)}</p>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <button onClick={() => handleLoad(r.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title={t("myrecipes.load")}>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDuplicate(r)} disabled={duplicatingId === r.id} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors" title={t("myrecipes.duplicate")}>
                    {duplicatingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title={t("myrecipes.delete")}>
                    {deletingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span>{r.quantity ?? '?'} × {r.dough_ball_weight ?? '?'}g</span>
                <span>{r.idratazione ?? '?'}%</span>
                <span>{r.maturation_hours}h</span>
                <span className="ml-auto">{new Date(r.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
