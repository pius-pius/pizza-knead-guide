import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, LogOut, BookOpen, Loader2, Check } from "lucide-react";

const Profile = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ full_name: fullName });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto px-4 py-8">
      <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("auth.back_home")}
      </button>
      <h1 className="text-2xl font-bold text-center mb-6">{t("auth.profile")}</h1>

      <div className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
          <p className="text-sm font-medium mt-1">{user.email}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">{t("auth.full_name")}</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
          <p className="text-sm font-medium mt-1 text-green-600">{profile?.is_active ? t("auth.active") : t("auth.inactive")}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">{t("auth.member_since")}</label>
          <p className="text-sm font-medium mt-1">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <><Check className="h-4 w-4 mr-1" />{t("auth.saved")}</> : t("auth.save_profile")}
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        <Button variant="outline" onClick={() => navigate("/my-recipes")} className="w-full rounded-xl">
          <BookOpen className="h-4 w-4 mr-2" /> {t("auth.my_recipes")}
        </Button>
        <Button variant="ghost" onClick={handleLogout} className="w-full rounded-xl text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" /> {t("auth.logout")}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
