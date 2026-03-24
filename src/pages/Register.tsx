import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

const Register = () => {
  const { signUp } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError(t("auth.fill_fields")); return; }
    if (password.length < 6) { setError(t("auth.password_min")); return; }
    if (password !== confirmPassword) { setError(t("auth.password_mismatch")); return; }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) setError(error);
    else setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto px-4 py-8 items-center justify-center">
        <div className="bg-card rounded-2xl p-6 shadow-sm text-center space-y-4">
          <h2 className="text-xl font-bold">{t("auth.signup_success_title")}</h2>
          <p className="text-sm text-muted-foreground">{t("auth.signup_success_desc")}</p>
          <Button onClick={() => navigate("/login")} className="rounded-xl">{t("auth.go_to_login")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto px-4 py-8">
      <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("auth.back_home")}
      </button>
      <h1 className="text-2xl font-bold text-center mb-6">{t("auth.register")}</h1>
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">{t("auth.full_name")}</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase">{t("auth.confirm_password")}</label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full rounded-xl">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.register")}
        </Button>
        <p className="text-sm text-center">
          {t("auth.has_account")} <Link to="/login" className="text-primary hover:underline">{t("auth.login")}</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
