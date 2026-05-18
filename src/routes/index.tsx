import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, Loader2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/store/useAuth";
import { loginWithEmail, signUpUser } from "@/lib/supabase-auth";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (user && !loading) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Preencha todos os campos.");
      return;
    }
    try {
      setIsLoggingIn(true);
      if (mode === "signup") {
        await signUpUser(email, password, displayName || undefined);
        toast.success("Conta criada! Entrando...");
        await loginWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
        toast.success("Bem-vindo!");
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erro ao conectar.";
      setErrorMsg(msg);
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="flex-1 flex w-full items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 flex flex-col items-center text-center space-y-6 animate-fade-up">
        <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-2">
          {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : <LogIn className="w-10 h-10" />}
        </div>

        <div>
          <h1 className="text-2xl font-heading font-black tracking-wider text-text uppercase">
            Tripla Eventos
          </h1>
          <p className="text-muted mt-2 text-sm leading-relaxed">
            Painel Administrativo v2.0
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Seu nome"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-base"
              disabled={isLoggingIn || loading}
              autoComplete="name"
            />
          )}
          <input
            type="email"
            placeholder="E-mail corporativo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base"
            disabled={isLoggingIn || loading}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Senha secreta"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base"
            disabled={isLoggingIn || loading}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />

          {errorMsg && <p className="text-red text-sm font-semibold">{errorMsg}</p>}

          <button
            type="submit"
            disabled={isLoggingIn || loading}
            className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {(isLoggingIn || loading) && <Loader2 className="w-5 h-5 animate-spin" />}
            {!isLoggingIn && !loading && (mode === "signup" ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />)}
            {loading
              ? "Conectando..."
              : isLoggingIn
              ? (mode === "signup" ? "Criando conta..." : "Autenticando...")
              : (mode === "signup" ? "Criar conta" : "Entrar no Painel")}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErrorMsg(""); }}
            className="text-xs text-muted hover:text-text transition-colors"
          >
            {mode === "login"
              ? "Primeiro acesso? Criar conta de admin"
              : "Já tenho conta — voltar ao login"}
          </button>
        </form>

        <p className="text-xs text-muted mt-4">
          Acesso restrito a colaboradores Tripla autorizados.
        </p>
      </div>
    </main>
  );
}
