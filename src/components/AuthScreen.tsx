/**
 * Tela de Autenticação (Login e Cadastro) do Zenith.
 * Estilo Dark Premium com Glassmorphism, feedback em tempo real e alternância suave.
 */
import { useState } from "react";
import { ZenithLogo } from "./ZenithLogo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "@/lib/auth";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function AuthScreen() {
  const { login, register, isLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Campos de Login
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Campos de Cadastro
  const [regName, setRegName] = useState("");
  const [regIdentifier, setRegIdentifier] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg("Preencha todos os campos para entrar.");
      return;
    }

    const res = await login({
      login: loginIdentifier,
      password: loginPassword,
    });

    if (!res.ok) {
      setErrorMsg(res.error || "Usuário ou senha incorretos.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg("Por favor, informe seu nome completo.");
      return;
    }
    if (!regIdentifier.trim()) {
      setErrorMsg("Por favor, informe seu login ou e-mail.");
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("As senhas digitadas não coincidem.");
      return;
    }

    const res = await register({
      name: regName,
      login: regIdentifier,
      password: regPassword,
    });

    if (!res.ok) {
      setErrorMsg(res.error || "Não foi possível criar a conta.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 selection:bg-primary selection:text-primary-foreground">
      {/* Luzes de fundo ambiente */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 size-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="glass-card relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        {/* Cabeçalho com Logotipo */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 transition-transform hover:scale-105">
            <ZenithLogo size={56} variant="wordmark" />
          </div>
          <p className="mt-1 text-xs font-semibold tracking-wider uppercase text-muted-foreground sm:text-xs">
            Foco • Organize • Conquiste
          </p>
        </div>

        {/* Abas Alternadoras (Login vs Criar Conta) */}
        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-secondary/60 p-1 ring-1 ring-border/50">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all sm:text-sm ${
              tab === "login"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all sm:text-sm ${
              tab === "register"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Criar Conta</span>
          </button>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-fade-in">
            <div className="mt-0.5 size-4 shrink-0 font-bold">⚠️</div>
            <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* FORMULÁRIO DE LOGIN */}
        {tab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <Label htmlFor="login-user" className="text-xs font-semibold text-foreground">
                Login ou E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="login-user"
                  type="text"
                  placeholder="Digite seu usuário ou e-mail"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="rounded-xl pl-10 h-11 bg-background/50 border-border/70 focus:border-primary focus:ring-primary/20 text-sm"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Sua senha de acesso"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="rounded-xl pl-10 pr-10 h-11 bg-background/50 border-border/70 focus:border-primary focus:ring-primary/20 text-sm"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  aria-label={showLoginPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Acessar o Painel</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>

            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground">
                Não tem uma conta ainda?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  Cadastre-se agora
                </button>
              </p>
            </div>
          </form>
        )}

        {/* FORMULÁRIO DE CADASTRO */}
        {tab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in">
            <div className="space-y-1.5">
              <Label htmlFor="reg-name" className="text-xs font-semibold text-foreground">
                Nome Completo
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="rounded-xl pl-10 h-11 bg-background/50 border-border/70 focus:border-primary focus:ring-primary/20 text-sm"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-login" className="text-xs font-semibold text-foreground">
                Login / Usuário / E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="reg-login"
                  type="text"
                  placeholder="Digite seu login ou e-mail"
                  value={regIdentifier}
                  onChange={(e) => setRegIdentifier(e.target.value)}
                  className="rounded-xl pl-10 h-11 bg-background/50 border-border/70 focus:border-primary focus:ring-primary/20 text-sm"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="reg-pass" className="text-xs font-semibold text-foreground">
                  Criar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    id="reg-pass"
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Mín. 6 dígitos"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="rounded-xl pl-9 pr-8 h-10 bg-background/50 border-border/70 focus:border-primary text-xs"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm" className="text-xs font-semibold text-foreground">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    id="reg-confirm"
                    type={showRegConfirmPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="rounded-xl pl-9 pr-8 h-10 bg-background/50 border-border/70 focus:border-primary text-xs"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    aria-label={showRegConfirmPassword ? "Ocultar confirmação de senha" : "Ver confirmação de senha"}
                  >
                    {showRegConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-primary/10 border border-primary/20 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary shrink-0" />
              <span>Seus dados ficam protegidos e salvos no PostgreSQL dedicado.</span>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="size-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Criar Conta e Entrar</span>
                </>
              )}
            </Button>

            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground">
                Já possui uma conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  Entrar aqui
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
