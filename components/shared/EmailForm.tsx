"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidEmail } from "@/lib/validators";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

interface EmailFormProps {
  onSuccess?: (count: number) => void;
  className?: string;
}

export function EmailForm({ onSuccess, className = "" }: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setUtmParams({
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
      });
    }
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.length > 0) {
      setIsValid(isValidEmail(value));
    } else {
      setIsValid(null);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmitting) return;

      const trimmedEmail = email.trim().toLowerCase();
      if (!isValidEmail(trimmedEmail)) {
        toast.error("Adresse email invalide.");
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmedEmail,
            ...utmParams,
          }),
        });

        const data = await response.json();

        if (response.status === 429) {
          toast.error(data.message || "Trop de tentatives. Réessaie plus tard.");
          return;
        }

        if (data.success) {
          toast.success(data.message);
          setEmail("");
          setIsValid(null);
          onSuccess?.(data.count);
        } else {
          toast.error(data.message || "Une erreur est survenue.");
        }
      } catch {
        toast.error("Erreur de connexion. Vérifie ta connexion internet.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, utmParams, onSuccess]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-3 w-full max-w-md ${className}`}
      noValidate
    >
      <div className="relative flex-1">
        <Input
          type="email"
          placeholder="ton.email@exemple.fr"
          value={email}
          onChange={handleEmailChange}
          disabled={isSubmitting}
          aria-label="Adresse email"
          aria-invalid={isValid === false}
          className={`h-12 bg-card border-border text-foreground placeholder:text-muted-foreground transition-all duration-200 ${
            isValid === true
              ? "border-success focus:border-success"
              : isValid === false
                ? "border-destructive focus:border-destructive"
                : "focus:border-accent focus:shadow-[0_0_20px_hsl(354_80%_57%/0.15)]"
          }`}
          id="email-input"
          autoComplete="email"
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || isValid === false}
        className="btn-cta h-12 px-6 bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        aria-label="Rejoindre la beta"
        id="submit-waitlist"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            Rejoindre la beta
            <ArrowRight className="size-4 ml-1" />
          </>
        )}
      </Button>
    </form>
  );
}
