"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { isValidEmail } from "@/lib/validators";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setLoading(false);
      if (signUpError.message.toLowerCase().includes("already registered")) {
        toast.error("Cet email est déjà utilisé. Connecte-toi.");
      } else {
        toast.error("Erreur lors de la création du compte.");
      }
      return;
    }

    // Sign in immediately so session exists regardless of email confirmation setting
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      toast.error("Compte créé — connecte-toi pour continuer.");
      router.push("/auth/login");
      return;
    }
    router.push("/profil");
    router.refresh();
  }

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full lg:mx-0 lg:max-w-none lg:w-1/2">
        <div className="max-w-sm mx-auto w-full">
          <Link href="/" className="inline-block mb-10">
            <Image src="/logo.png" alt="MonBaito" width={160} height={44} className="h-11 w-auto" />
          </Link>

          <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-1">
            Créer un compte
          </h1>
          <p className="text-sm text-muted-foreground mb-8" style={{ fontFamily: "var(--font-label)" }}>
            Déjà inscrit ?{" "}
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              Se connecter
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
                  placeholder="6 caractères minimum"
                  autoComplete="new-password"
                  required
                  className="form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-destructive mt-1" style={{ fontFamily: "var(--font-label)" }}>
                  Trop court — 6 caractères minimum.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5" style={{ fontFamily: "var(--font-label)" }}>
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className={`form-input pr-10 ${
                    passwordsMismatch
                      ? "border-destructive focus:border-destructive"
                      : passwordsMatch
                        ? "border-success focus:border-success"
                        : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Masquer" : "Afficher"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-destructive mt-1" style={{ fontFamily: "var(--font-label)" }}>
                  Les mots de passe ne correspondent pas.
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-success mt-1" style={{ fontFamily: "var(--font-label)" }}>
                  Les mots de passe correspondent.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordsMismatch}
              className="btn-cta w-full flex items-center justify-center gap-2 py-3 bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "CRÉER MON COMPTE"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 leading-relaxed" style={{ fontFamily: "var(--font-label)" }}>
            En créant un compte, tu acceptes nos{" "}
            <Link href="/cgu" className="underline hover:text-foreground">CGU</Link>
            {" "}et notre{" "}
            <Link href="/confidentialite" className="underline hover:text-foreground">politique de confidentialité</Link>.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-100 border-l border-border flex-col justify-center px-12">
        <p className="text-xs font-bold text-accent uppercase tracking-widest mb-6" style={{ fontFamily: "var(--font-label)" }}>
          Beta privée — 100 places
        </p>
        <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-8 leading-tight">
          Tu construis
          <br />
          le produit avec nous.
        </h2>
        <div className="space-y-6" style={{ fontFamily: "var(--font-label)" }}>
          {[
            { num: "01", text: "Accès gratuit à toutes les fonctionnalités" },
            { num: "02", text: "Ton feedback façonne directement le produit" },
            { num: "03", text: "3 mois de Pro offerts au lancement" },
          ].map(({ num, text }) => (
            <div key={num} className="flex gap-4 items-start">
              <span className="text-xs uppercase tracking-widest text-neutral-400 shrink-0 mt-0.5">{num}</span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
