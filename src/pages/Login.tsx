import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

const Login = () => {
  const { signIn, resetPassword } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError(t("auth.fill_fields")); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate("/");
  };

  const handleReset = async () => {
    if (!email) { setError(t("auth.enter_email")); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) setError(error);
    else setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto px-4 py-8">
      <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("auth.back_home")}
      </button>
      <h1 className="text-2xl font-bold text-center mb-6">{t("auth.login")}</h1>

      {showReset ? (
        <div className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
          <p className="text-sm text-muted-foreground">{t("auth.reset_desc")}</p>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {resetSent && <p className="text-sm text-green-600">{t("auth.reset_sent")}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleReset} disabled={loading} className="w-full rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.send_reset")}
          </Button>
          <button onClick={() => { setShowReset(false); setError(""); }} className="text-sm text-primary hover:underline w-full text-center">
            {t("auth.back_to_login")}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.login")}
          </Button>
          <div className="flex justify-between text-sm">
            <button type="button" onClick={() => setShowReset(true)} className="text-primary hover:underline">{t("auth.forgot_password")}</button>
            <Link to="/register" className="text-primary hover:underline">{t("auth.no_account")}</Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
