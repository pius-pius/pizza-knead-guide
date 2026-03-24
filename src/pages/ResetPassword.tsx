import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError(t("auth.password_min")); return; }
    if (password !== confirmPassword) { setError(t("auth.password_mismatch")); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("auth.invalid_reset_link")}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card rounded-2xl p-6 shadow-sm text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-bold">{t("auth.password_updated")}</h2>
          <Button onClick={() => navigate("/")} className="rounded-xl">{t("auth.back_home")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto px-4 py-8 justify-center">
      <h1 className="text-2xl font-bold text-center mb-6">{t("auth.new_password")}</h1>
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">{t("auth.new_password")}</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">{t("auth.confirm_password")}</label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full rounded-xl">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.update_password")}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
