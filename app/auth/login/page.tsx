"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { isValidEmail } from "@/lib/validators";
import { toast } from "sonner";
import { ShieldCheck, Zap, Eye, EyeOff } from "lucide-react";
import { Loader2 } from "lucide-react";

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "Offres vérifiées anti-arnaque" },
  { icon: Zap, label: "Candidature en 1 clic" },
  { icon: ShieldCheck, label: "Tes données ne sont jamais revendues" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error("Adresse email invalide.");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect.");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Email non confirmé. Vérifie ta boîte mail ou recrée un compte.");
      } else {
        toast.error("Erreur de connexion. Réessaie.");
      }
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full lg:mx-0 lg:max-w-none lg:w-1/2">
        <div className="max-w-sm mx-auto w-full">
          <Link href="/" className="inline-block mb-10">
            <Image src="/logo.png" alt="MonBaito" width={160} height={44} className="h-11 w-auto" />
          </Link>

          <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-1">
            Connexion
          </h1>
          <p className="text-sm text-muted-foreground mb-8" style={{ fontFamily: "var(--font-label)" }}>
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-accent hover:underline font-medium">
              Créer un compte
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5" style={{ fontFamily: "var(--font-label)" }}>
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toi@exemple.fr"
                autoComplete="email"
                required
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5" style={{ fontFamily: "var(--font-label)" }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cta w-full flex items-center justify-center gap-2 py-3 bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "SE CONNECTER"}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel — visual (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-100 border-l border-border flex-col justify-center px-12">
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-6" style={{ fontFamily: "var(--font-label)" }}>
          Pourquoi MonBaito ?
        </p>
        <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-8 leading-tight">
          Fini les arnaques.
          <br />
          Fini les heures perdues.
        </h2>
        <div className="space-y-4">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/10 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-accent" />
              </div>
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 p-4 border border-border bg-background">
          <p className="text-sm text-foreground font-medium mb-1">
            &quot;MonBaito m&apos;a évité une arnaque en 2 minutes.&quot;
          </p>
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-label)" }}>
            — Emma, étudiante en L2, Rouen
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
